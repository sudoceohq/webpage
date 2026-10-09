export const site = {
  name: 'Egor Markowskij',
  alias: 'Sudoceo',
  description: 'The personal website of Egor Markowskij, also known as Sudoceo. Work, writing, and a place to connect.',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'egor.a.markowskij@sudoceo.com',
  github: import.meta.env.PUBLIC_GITHUB_URL || 'https://github.com/sudoceohq',
};
export const navigation = [
  { title: 'Home', href: '/' },
  { title: 'Work', href: '/work/' },
  { title: 'Writing', href: '/writing/' },
  { title: 'About', href: '/about/' },
  { title: 'Contact', href: '/contact/' },
];
