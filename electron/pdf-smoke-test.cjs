const { app } = require('electron');
const { generateLatestOutlinePdf } = require('./outline.cjs');

app.whenReady().then(async () => {
  try {
    const result = await generateLatestOutlinePdf();
    console.log(JSON.stringify(result, null, 2));
    app.exit(0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
