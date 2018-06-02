const cityList = ["BEIJING_BEIJING", "TIANJIN_TIANJIN", "HEBEI_SHIJIAZHUANG", "SHANXI_TAIYUAN", "ANHUI_HEFEI", "FUJIAN_XIAMEN", "FUJIAN_FUZHOU", "JIANGSU_NANJING", "JIANGSU_SUZHOU", "JIANGSU_NANTONG", "JIANGSU_YANGZHOU", "JIANGXI_NANCHANG", "SHANDONG_JINAN", "SHANDONG_QINGDAO", "SHANDONG_WEIFANG", "SHANDONG_WEIHAI", "SHANGHAI_SHANGHAI", "ZHEJIANG_HANGZHOU", "ZHEJIANG_NINGBO", "GUANGDONG_GUANGZHOU", "GUANGDONG_SHENZHEN", "GUANGXI_NANNING", "HENAN_LUOYANG", "HENAN_ZHENGZHOU", "HUBEI_WUHAN", "HUNAN_CHANGSHA", "HEILONGJIANG_HAERBIN", "JILIN_CHANGCHUN", "LIAONING_DALIAN", "LIAONING_SHENYANG", "GANSU_LANZHOU", "NEIMENGGU_HUHEHAOTE", "SHAANXI_XIAN", "XINJIANG_WULUMUQI", "CHONGQING_CHONGQING", "SICHUAN_CHENGDU", "YUNNAN_KUNMING"];
const cityListCN = ["北京", "天津", "石家庄", "太原", "合肥", "厦门", "福州", "南京", "苏州", "南通", "扬州", "南昌", "济南", "青岛", "潍坊", "威海", "上海", "杭州", "宁波", "广州", "深圳", "南宁", "洛阳", "郑州", "武汉", "长沙", "哈尔滨", "长春", "大连", "沈阳", "兰州", "呼和浩特", "西安", "乌鲁木齐", "重庆", "成都", "昆明"];
const cityObj = {};
cityList.forEach((val, ind) => {
  const key = val.split('_')[1].toLowerCase();
  cityObj[key] = {
    en: val, 
    cn: cityListCN[ind]
  };
});
// $('#cityChoose').click(() => {
//   $('#cityList').toggle('show')
// });


let changeColor = document.getElementById('search');
chrome.storage.sync.get('color', function (data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

chrome.storage.sync.get('res', function (data) {
  if (data) {
    $('#res').empty();    
    $('#res').append(syntaxArr(data.res));
  }
});

function padLeft(str) {
  return ('0000' + str).slice(-2);
}

changeColor.onclick = function (element) {
  const ym = `${$('#year').val()}-${padLeft($('#month').val())}`;
  const neeaID = '71470690';
  let selectedCities = '';// "SHANDONG_QINGDAO;SHANDONG_WEIFANG;SHANDONG_WEIHAI;SHANGHAI_SHANGHAI;"  
  let selectedCitiesNames = ''; // "青岛;潍坊;威海;上海;"  
  $('#cityList input').each((ind, ele) => {
    if(ele.checked) {
      selectedCities += cityObj[ele.id.toLowerCase()].en + ';';
      selectedCitiesNames += cityObj[ele.id.toLowerCase()].cn + ';';
    }
  });
  let whichFirstPara = 'AS';// 'AS' for 时间优先 'SA' for 地点优先
  const option = {
    p: "testSites",
    m: "ajax",
    ym,
    neeaID,
    cities: selectedCities,
    citiesNames: encodeURI(selectedCitiesNames),
    whichFirst: whichFirstPara,
    isFilter: 0,
    isSearch: 1
  };
  chrome.storage.sync.set({
    option: option
  });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code: 'helper()'
      });
  });
};

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    $('#res').empty();
    $('#res').append(syntaxArr(request));
    chrome.storage.sync.set({ res: request }, function () {
      console.log(request);
    });
  });

function syntaxArr(arr) {
  const cont = document.createElement('div');
  $(cont).append(`<p>Updated on ${(new Date()).toLocaleString()}</p>`)
  if (arr.length) {
    arr.forEach((city) => {
      city.dates.forEach((date) => {
        const dateDiv = document.createElement('div');
        $(dateDiv).append($(`<p class="date-p">${date.bjTime}</p>`));
        const dateTable = document.createElement('table');
        date.sites.forEach((site) => {
          const isFull = site.realSeats === 1? 'NotFull' : 'Full';
          $(dateTable).append($(`<tr>
          <td>${site.siteCode}</td> 
          <td>${site.siteName}</td>
          <td class="${isFull === 'Full'? '':'n-full'}">${isFull}</td></tr>`));
        });
        $(dateDiv).append($(dateTable));
        $(cont).append($(dateDiv));
      });
    });
  }
  return $(cont);
}
