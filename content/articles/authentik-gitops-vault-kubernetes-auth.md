---
title: "Authentik on GitOps, and the Vault token that belonged to the wrong Vault"
description: "I moved my homelab identity provider onto the management cluster with Helm, then replaced a stored Vault token with Kubernetes auth for the OpenTofu root that manages Authentik."
pubDate: 2026-10-26
status: draft
origin: manual
tags: [gitops, kubernetes, vault, opentofu, authentik]
sourceUrls:
  - https://github.com/ThriftyStack/platform/commit/9b2dfa5fc54762f13f58759ad7177bee15d3a29c
  - https://github.com/ThriftyStack/controlplane/pull/4
---

Authentik is the identity provider for ThriftyStack, my homelab platform. The containers used to run as Compose on Proxmox. That left the IdP outside GitOps, with no enabled backup. The OpenTofu root that manages groups and OIDC applications authenticated to Vault with a token stored in Secret Manager. That token belonged to a different Vault. The management Vault rejected it.

I put the runtime on the management cluster as a Helm chart, and I switched the Vault provider to Kubernetes auth.

## The IdP sat outside GitOps

`ThriftyStack/platform` is the Argo CD source for the management cluster. Stages move through `promote-pr`, which opens a GitHub PR and never auto-merges, never force-pushes, and never calls Argo sync APIs. After a human merges, Argo reconciles from `main`.

Identity objects live in `ThriftyStack/controlplane`. A Crossplane OpenTofu Workspace applies groups `homelab-users` and `homelab-admins`, and OAuth2 applications for Grafana, Vault, and Proxmox. Ansible must not reconcile those objects.

The Authentik containers were not in that rollout. Compose on a Proxmox VM kept the auth hostname reachable for the tunnel, but the stack was not in GitOps. I later stopped the Ansible site runs that deployed that Compose stack, and I pointed DNS and the tunnel at the management NodePort. Those cutovers are not in the two public sources.

A GitOps IdP still needs secrets. The chart expects Secret `authentik-credentials` in namespace `authentik` before the first sync. Management Vault path `infra/authentik` holds the API token the Workspace uses. It is also the place to mirror `secret_key` and `pg_password` for recovery. A bootstrap script seeds those KV secrets. The public chart README still shows the Kubernetes Secret being created by hand.

## Helm on the management cluster

I added wrapper chart `thrifty-authentik` around the official Authentik chart 2026.5.6. Identity objects stay in `ThriftyStack/controlplane`. A new stage `authentik` renders an Application for the chart in namespace `authentik` on sync-wave 75. The identity Workspace stays on wave 80, so the runtime Application has to sync first. The management cluster profile sets `stages.authentik` to true in the same change.

The server Service is NodePort. The tunnel still needs a host port on the node.

```yaml
authentik:
  server:
    replicas: 1
    service:
      type: NodePort
      nodePortHttp: 30080
      nodePortHttps: 30443
      servicePortHttp: 80
      servicePortHttps: 443
```

The offline chart check asserts that a Service of type NodePort exposes HTTP on 30080 for the tunnel. PostgreSQL stays in the chart, with persistence on Longhorn, size 10Gi. That is a disk. It is not a backup job.

## The token belonged to a different Vault

The Workspace applies the Authentik root against the in-cluster management Vault. The Secret Manager token was issued for another Vault. Login failed before OpenTofu could read `infra/authentik` key `tofu-api-token` and call the Authentik API.

The platform already had Kubernetes auth role `authentik-tofu` on mount `kubernetes-management` for service account `provider-opentofu` in `crossplane-system`. I pointed the Vault provider at that login and removed the Google provider and the Secret Manager read.

```hcl
provider "vault" {
  address = var.vault_addr

  auth_login {
    path = "auth/kubernetes-management/login"

    parameters = {
      role = "authentik-tofu"
      jwt  = try(file("/var/run/vault-auth/token"), "")
    }
  }
}
```

The Authentik API token stays an ephemeral Vault KV read, so it never lands in state.

The provider pod runs as `provider-opentofu` and mounts a projected service account token, read-only, at `/var/run/vault-auth`.

```yaml
- name: vault-auth
  projected:
    sources:
      - serviceAccountToken:
          audience: vault://crossplane-system/authentik-tofu
          expirationSeconds: 3600
          path: token
```

Audience, role, and mount have to match. The token TTL is 3600 seconds.

`ThriftyStack/controlplane` is public, so the git credential secret can be created from an empty file. The Workspace still uses a GCP key for the state backend.

## Gotchas

OpenTofu 1.12 evaluates `file()` during `tofu validate`. Validate runs outside the pod, where the projected token does not exist. Bare `file()` fails that check. `try(file(...), "")` lets validate run without the file. When the token is mounted, `file()` returns it. When it is missing, the JWT is empty and Vault rejects the login. That empty string is not a skipped login. It is a failed login on purpose.

I verified the root with OpenTofu 1.12.6.

- `tofu init -backend=false && tofu validate` succeeded in `authentik/`, with a pre-existing deprecation warning on `data.vault_kv_secret_v2.credentials`.
- `make -C authentik check` passed. The groups tests reported 4 passed.
- `make -C deploy check` passed.
- I did not run plan or apply.

NodePort is a compromise. An in-cluster Service would be cleaner for mesh traffic. The tunnel originates outside the cluster, so the chart keeps HTTP on 30080.

Audience is easy to get wrong. The projected token uses `vault://crossplane-system/authentik-tofu`. The default Kubernetes audience would not satisfy that role.

## What is still open

The Compose stack had no enabled backup. Moving it to Helm did not add one. Longhorn holds the 10Gi volume. The chart README talks about mirroring keys into Vault for recovery, not about snapshots.

The Vault login change is in git and in the offline checks. `tofu validate` does not prove that the role, the audience, and the in-cluster Vault agree at apply time.

## Takeaway

Put the IdP in the same Argo CD rollout as the cluster that depends on it. Do not store a Vault token for a Vault you are not calling. Let the Workspace log in with the service account the cluster already trusts, and wrap `file()` so validate still runs outside the pod.
