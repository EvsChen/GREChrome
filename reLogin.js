/**
 * @fileOverview helper function that's injected into target page
 */

sendLog('Relogin...');
    reloadImage()
        .then(() => recognizeCode('bgpage'))
        .then(captcha => {
            login(captcha);
            chrome.runtime.sendMessage({
                type: 'loginStatus',
                data: 'trylogin'
            },
            response => { sendLog(response);});
        });

function sendLog(data, type = 'log') {
    console.log(data);
    chrome.runtime.sendMessage({
        type,
        data
    },
        response => {
            if (response) {
                console.log(response);
            }
        });
}

/**
 * @returns {Promise} - findImagePromise
 */
function findImage() {
    const findImagePromise = new Promise((resolve, reject) => {
        if (!$('#chkImg')[0].src) {
            sendLog('Url not found');
            const ev = new Event('focus');
            const ip = document.getElementById('checkImageCode');
            ip.dispatchEvent(ev);
            // TODO: wrap check condition into a common util
            const intv = setInterval(() => {
                sendLog('url checked');
                let src = $('#chkImg')[0].src;
                if (src && src !== 'https://gre.etest.net.cn/resources/images/loading.gif') {
                    sendLog(src);
                    clearInterval(intv);
                    resolve();
                }
            }, 500);
        }
        else {
            resolve();
        }
    });
    return findImagePromise;
}

/**
 * @param {string} params - 'ocr' || 'bgpage'
 * @returns {Promise} captchaPromise
 */
function recognizeCode(params) {
    const myImage = document.getElementById('chkImg');
    const imgSrc = myImage.src;
    sendLog(imgSrc);
    // https://checkimage.etest.net.cn/5D5272EB88E8072EA2C595A9B11A63D4.jpg
    if (params === 'ocr') {
        const fullFileName = imgSrc.split('/').slice(-1)[0];
        const fileName = fullFileName.split('.')[0];
        const captchaUrl = `http://localhost:5000/captcha/${fileName}`;
        const captchaPromise = new Promise((resolve, reject) => {
        $.get(captchaUrl, res => {
            sendLog(`Recognized code: ${res}`);
            resolve(res);
        })
            .fail(() => {
                reject('Recognize captcha failed');
            });
        });
        return captchaPromise;
    }
    else if (params === 'bgpage') {
        const captchaPromise = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'imgSrc',
                data: imgSrc
            },
            response => {
                sendLog('Captcha received');
                resolve(response.captcha);
            });
        });
       return captchaPromise; 
    }
}


function login(captcha) {
    document.getElementById('checkImageCode').value = captcha;
    $('#loginForm input.btn.btn-primary').click();
    sendLog('LoginClicked', 'LOGIN_STATUS');
}

function reloadImage() {
    const myImage = document.getElementById('chkImg');
    myImage.click();
    return new Promise((resolve, reject) => {
        $(document).ready(() => {
            resolve();
        });
    });
}