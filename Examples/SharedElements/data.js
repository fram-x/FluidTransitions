import { Dimensions } from 'react-native';

export const createItemsData = () => {
  const users = getRandomImages(15, 30).map(img => ({
    source: img,
    name: ['Marge Manns',
      'Wallace Doe',
      'Cheryle Hodnett',
      'Jared Muszynski',
      'Jayme Poyer',
      'Gina Dennett'][Math.floor((Math.random() * 6))],
  }));

  const createComments = () => {
    const comments = [];
    for (let i = 0; i < Math.floor((Math.random() * 6) + 4); i++) {
      comments.push({
        text: ['Great picture! Thanks', 'I like it!', 'Wow! Great', 'Cool!', 'Thanks :-)', ':-)'][Math.floor((Math.random() * 6))],
        avatar: users[Math.floor((Math.random() * 15))],
      });
    }
    return comments;
  };
  const items = getRandomImages(15, Dimensions.get('window').width).map(img => ({
    source: img,
    comments: createComments(),
    avatar: users[Math.floor((Math.random() * 15))],
  }));
  return items;
};

const getRandomImages = (count: number, size: number) => {
  const items = [];
  const randMax = 100;
  for (let i = 0; i < count; i++) {
    let randomNumber = Math.floor((Math.random() * randMax) + 1);
    const idExists = (e) => e.id === randomNumber;
    while (items.findIndex(idExists) > -1) {
      randomNumber = Math.floor((Math.random() * randMax) + 1);
    }

    items.push({ url: `https://picsum.photos/${size}/${size}?image=${randomNumber}`, id: randomNumber });
  }
  return items;
};
