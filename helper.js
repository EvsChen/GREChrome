/**
 * @fileOverview helper function that's injected into target page
 */
chrome.runtime.sendMessage({
    type: 'currentUrl',
    data: window.location.href
}, 
response => {
    console.log(response);
});


function helper() {
    let url = 'testSites.do';
    $.ajaxSetup({ cache: true });
    // Get option from the storage
    chrome.storage.sync.get(['option'], data => {
        console.log(data.option);
        $.getJSON(url, data.option, (responseJSON) => {
            console.log(responseJSON);
            chrome.runtime.sendMessage({
                type: 'responseJSON',
                data: responseJSON
            },
            response => {
                console.log(response);
            });
        });
    });
}

// send message to the background page when page loads 
// and execute scripts 
function recognize() {
    if (!$('#chkImg')[0].src) {
        console.log('Url not found');
        const ev = new Event('focus');
        const ip = document.getElementById('checkImageCode');
        ip.dispatchEvent(ev);
        const intv = setInterval(() => {
            console.log('url checked');
            let src = $('#chkImg')[0].src;
            if (src && src != 'https://gre.etest.net.cn/resources/images/loading.gif') {
                console.log(src);
                clearInterval(intv);
                recognizeCode();
            }
        }, 500);
    }
    else {
        recognizeCode();        
    }

    function recognizeCode() {
        const myImage = document.getElementById('chkImg');
        const imgSrc = myImage.src;
        console.log(imgSrc);
        // https://checkimage.etest.net.cn/5D5272EB88E8072EA2C595A9B11A63D4.jpg
        const fullFileName = imgSrc.split('/').slice(-1)[0];
        const fileName = fullFileName.split('.')[0];
        const captchaUrl = `http://localhost:5000/captcha/${fileName}`;
        $.get(captchaUrl, res => {
            document.getElementById('checkImageCode').value = res;
            $('#loginForm input.btn.btn-primary').click();
        });
    }
}