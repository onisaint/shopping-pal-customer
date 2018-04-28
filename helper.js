const URL = "http://ctp.westus.cloudapp.azure.com/imageTagger/execute";
const cognitiveApi = "http://18.130.69.207:8080/cognitivelearning/queryProduct/tags?image_tags="

/**
 * @description converts base64 to file
 * @param {base64} String
 * @param {filename} filename
 * @returns {File} File
 */
const btof = (base64Image, filename) =>
    fetch(base64Image)
        .then(res => res.arrayBuffer())
        .then(buf => new File([buf], filename, { type: (base64Image.match(/^data:([^;]+);/) || '')[1] }));


function postCognitive(camera) {
    const base64Image = camera;
    return btof(base64Image, "image.png")
}

function getStubCognitive() {
    const random = [['iPod', 'touch screen, touchscreen', 'display, video display', 'video iPod', 'electronic device'], ['iPod', 'appliance, contraption, contrivance, convenience, gadget, gizmo, gismo, widget', 'electronic device', 'device', 'cellular telephone, cellular phone, cellphone, cell, mobile phone'], ['iPod', 'appliance, contraption, contrivance, convenience, gadget, gizmo, gismo, widget', 'electronic device', 'video iPod', 'touch screen, touchscreen'], ['iPod', 'flash memory', 'cellular telephone, cellular phone, cellphone, cell, mobile phone', 'memory device, storage device', 'touch screen, touchscreen'], ['drive', 'memory device, storage device', 'flash memory', 'auxiliary storage, external storage, secondary storage', 'appliance, contraption, contrivance, convenience, gadget, gizmo, gismo, widget']];

    const callUrl = `${cognitiveApi}[${encodeURI(random[Math.round((Math.random() * 10) % 5)])}]`

    console.log(callUrl);

    return fetch(callUrl);
}