const fs = require('fs');
const { Innertube, Platform } = require('youtubei.js');
const { Readable } = require('stream');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

// Provide custom JS interpreter for deciphering URLs
Platform.shim.eval = async (data) => {
  return new Function(data.output)();
};

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter YouTube URL: ', async function(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    console.error('Error: Invalid YouTube URL');
    rl.close();
    return;
  }

  rl.question('Download (v)ideo or (a)udio? ', async function(type) {
    try {
      console.log('Initializing YouTube downloader client...');
      const yt = await Innertube.create({
        client_type: 'ANDROID',
        device_category: 'MOBILE'
      });

      console.log('Fetching stream details...');
      const stream = await yt.download(videoId, {
        type: 'videoandaudio',
        quality: 'best',
        format: 'mp4'
      });

      const nodeStream = Readable.fromWeb(stream);

      if (type.toLowerCase() === 'a') {
        const audioOutput = 'audio.mp3';
        console.log(`Extracting audio to ${audioOutput}...`);
        ffmpeg(nodeStream)
          .noVideo()
          .audioBitrate(128)
          .save(audioOutput)
          .on('end', () => {
            console.log(`Audio saved as ${audioOutput}`);
            rl.close();
          })
          .on('error', (err) => {
            console.error('FFmpeg processing error:', err.message || err);
            rl.close();
          });
      } else {
        const videoOutput = 'video.mp4';
        console.log(`Saving video to ${videoOutput}...`);
        const fileStream = fs.createWriteStream(videoOutput);
        nodeStream.pipe(fileStream);

        fileStream.on('finish', () => {
          console.log(`Video saved as ${videoOutput}`);
          rl.close();
        });

        fileStream.on('error', (err) => {
          console.error('Error writing file:', err.message || err);
          rl.close();
        });
      }
    } catch (err) {
      console.error('Download error:', err.message || err);
      rl.close();
    }
  });
});