const imagemin = require('imagemin-keep-folder');
const imageminPngquant = require('imagemin-pngquant');
 
(async () => {
    await imagemin(['../images/**/*.gif'], {
        plugins: [
            imageminPngquant()
        ]
    });
 
    console.log('Images optimized');
})();