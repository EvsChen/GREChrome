function helper() {
    let url = 'testSites.do';
    $.ajaxSetup({
        cache: true //关闭AJAX相应的缓存
    });
    chrome.storage.sync.get(['option'], data => {
        console.log(data.option);
        $.getJSON(url, data.option, function (responseJSON) {
            console.log(responseJSON);
            chrome.runtime.sendMessage(responseJSON, function (response) {
                console.log(response);
            });
        });
    });   
}