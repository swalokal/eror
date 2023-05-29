const tf = require('@tensorflow/tfjs-node');
const image = require('get-image-data');
const fs = require('fs');
var path = require('path');

const classes = ['rock', 'paper', 'scissors'];

exports.makePredictions = async (req, res, next) => {
    const imagePath = `./public/images/${req && req['filename']}`;
    try {
      const loadModel = async (img) => {
        const output = {};
        // laod model
        console.log('Loading.......')
        console.log(imagePath);
        const model = await tf.node.loadSavedModel(path.join(__dirname,'..', 'SavedModel'));
        // classify
        // output.predictions = await model.predict(img).data();
        let predictions = await model.predict(img).data();
        predictions = Array.from(predictions);
        output.success = true;
        output.message = `Success.`;
        output.predictions = predictions;
        console.log(output);
        res.statusCode = 200;
        res.json(output);
      };
      await image(imagePath, async (err, imageData) => {
        try {
            const image = fs.readFileSync(imagePath);
            console.log(image);
            let tensor = tf.node.decodeImage(image);
            const resizedImage = tensor.resizeNearestNeighbor([150, 150]);
            const batchedImage = resizedImage.expandDims(0);
            const input = batchedImage.toFloat().div(tf.scalar(255));
            console.log(imagePath);
            console.log('hay');
            await loadModel(input);
            // delete image file
            fs.unlinkSync(imagePath, (error) => {
            if (error) {
              console.log('kamu');
                console.error(error);
            }
            });
        } catch (error) {
          console.error(error)
          res.status(500).json({message: error});   
        }
      });
    } catch (error) {
      console.error(error)
      console.log(imagePath);
    }
  };