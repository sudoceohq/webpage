const role = 'Junior DevOps and platform engineer';

export const site = {
  name: 'Egor Markowskij',
  alias: 'Sudoceo',
  role,
  contactHeading: 'Open roles',
  contactCta: 'Roles and collaboration',
  description: `Egor Markowskij, also known as Sudoceo. ${role}. Selected work, writing, and contact.`,
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'egor.a.markowskij@sudoceo.com',
  linkedin: 'https://www.linkedin.com/in/egor-markowskij/',
  github: import.meta.env.PUBLIC_GITHUB_URL || 'https://github.com/sudoceohq',
};
export const navigation = [
  { title: 'Home', href: '/' },
  { title: 'Work', href: '/work/' },
  { title: 'Writing', href: '/writing/' },
  { title: 'About', href: '/about/' },
  { title: 'Contact', href: '/contact/' },
];
