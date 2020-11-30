const database = require('../database');
const dayjs = require('dayjs');
const fs = require('fs-extra');
const path = require('path');

const saveImages = async ({ data, name, images, path: filePath }) => {
  await Promise.all(
    Object.keys(images).map(async image => {
      let splits = images[image].split('.');
      let extension = splits[splits.length - 1];
      const username = name.replace(/ /g, '-');
      const imageLabel = image.toUpperCase();
      const today = dayjs().format('DD-MM-YYYY');
      const fileName = `${username}-${imageLabel}-${today}.${extension}`;
      let imagePath = path.join(database.imagesPath, filePath, fileName);
      await fs.copy(images[image], imagePath);
      data[image] = 'file:' + imagePath;
    }),
  );
  return data;
};

module.exports = { saveImages };
