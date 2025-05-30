const fs = require('fs');
const ytdl = require('ytdl-core');

ytdl('https://www.youtube.com/watch?v=jkW4MsXif0U')
  .pipe(fs.createWriteStream('video.mp4'));