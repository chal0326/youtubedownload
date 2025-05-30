const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter YouTube URL: ', function(url) {
  rl.question('Download (v)ideo or (a)udio? ', function(type) {
    if (type.toLowerCase() === 'a') {
      const audioOutput = 'audio.mp3';
      const stream = ytdl(url, { filter: 'audioonly' });
      ffmpeg(stream)
        .audioBitrate(128)
        .save(audioOutput)
        .on('end', () => {
          console.log(`Audio saved as ${audioOutput}`);
          rl.close();
        });
    } else {
      const videoOutput = 'video.mp4';
      ytdl(url)
        .pipe(fs.createWriteStream(videoOutput))
        .on('finish', () => {
          console.log(`Video saved as ${videoOutput}`);
          rl.close();
        });
    }
  });
}); 