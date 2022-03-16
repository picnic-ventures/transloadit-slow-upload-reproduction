const Transloadit = require('transloadit')
const fs = require('fs')

const authKey = process.argv[2]
const authSecret = process.argv[3]
const transloadit = new Transloadit({
  authKey,
  authSecret,
});

(async () => {
  if (transloadit == null) {
    throw new Error('Transloadit not loaded')
  }
  const path = './test.m4a';
  const fileStream = fs.createReadStream(path);

  const options = {
    uploads: {
      testupload: fileStream,
    },
    params: {
      steps: {
        mp3: {
          use: ':original',
          robot: '/audio/encode',
          preset: 'mp3',
          ffmpeg_stack: 'v4.3.1',
          ffmpeg: {
            ac: 1,
            af: 'highpass=f=80, lowpass=f=14000',
            'q:a': 7,
          },
          result: true,
        },
        waveform: {
          robot: '/audio/waveform',
          use: 'mp3',
          format: 'json',
          result: true,
        },
        exportOriginal: {
          use: [':original'],
          path: 'audio/${unique_prefix}/${file.basename}.${file.ext}',
          robot: '/s3/store',
          credentials: 'user-media',
        },
        export: {
          use: ['mp3', 'waveform'],
          path: 'audio/${unique_prefix}/${file.url_name}',
          robot: '/s3/store',
          credentials: 'user-media',
        },
      },
    },
    waitForCompletion: true,
  }

  console.log('before transloadit.createAssembly')
  const assembly = await transloadit.createAssembly(options)
  console.log('after transloadit.createAssembly')
  console.log(JSON.stringify(assembly, null, 2));
})()
