function reset() {
    if (confirm('抽選履歴を消します！リセットしますか？')) {
        localStorage.clear();
        location.reload(true);
    }
};
// 滚动球中最大显示人数
let maxViewLength = 500;
// 每次最多抽奖人数
let maxPrizeNum = 50;
(function () {
    var choosed = JSON.parse(localStorage.getItem('choosed')) || {};
    console.log(choosed);
    var speed = function () {
        return [0.1 * Math.random() + 0.01, -(0.1 * Math.random() + 0.01)];
    };
    var getKey = function (item) {
        return item.name + '-' + item.actno;
    };
    var createHTML = function () {
        var html = ['<ul>'];
        let memberLength = member.length;
        let viewLength = memberLength > maxViewLength ? maxViewLength : memberLength;
        for (let i = 0; i < viewLength; i++) {
            item = member[i];
            var key = getKey(item);
            var color = choosed[key] ? 'yellow' : 'white';
            html.push('<li><a href="#" style="color: ' + color + ';font-size:24px;">' + item.name + '</a></li>');
        }
        // member.forEach(function(item, index){
        //     item.index = index;
        //     var key = getKey(item);
        //     var color = choosed[key] ? 'yellow' : 'white';
        //     html.push('<li><a href="#" style="color: ' + color + ';">' + item.name + '</a></li>');
        // });
        html.push('</ul>');
        return html.join('');
    };
    var lottery = function (count, prize) {
        var list = canvas.getElementsByTagName('a');
        var color = 'yellow';
        var ret = member
            .filter(function (m, index) {
                m.index = index;
                return !choosed[getKey(m)];
            })
            .map(function (m) {
                return Object.assign({
                    score: Math.random()
                }, m);
            })
            .sort(function (a, b) {
                return a.score - b.score;
            })
            .slice(0, count)
            .map(function (m) {
                choosed[getKey(m)] = prize;
                var index = m.index;
                if (index < maxViewLength) {
                    console.log(index);
                    list[index].style.color = color;
                }
                let actNo = m.actno
                if (m.actno == " " || m.actno == undefined) {
                    actNo = "社員番号なし"
                }
                return m.name + '<br/>' + actNo;
            });
        localStorage.setItem('choosed', JSON.stringify(choosed));
        return ret;
    };
    var formatDate = function (date, fmt) {
        date = +date;
        if (isNaN(date)) {
            return
        }
        date = date == undefined ? new Date() : date;
        date = typeof date == 'number' ? new Date(date) : date;
        fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
        var obj = {
            'y': date.getFullYear(), // 年份，注意必须用getFullYear
            'M': date.getMonth() + 1, // 月份，注意是从0-11
            'd': date.getDate(), // 日期
            'q': Math.floor((date.getMonth() + 3) / 3), // 季度
            'w': date.getDay(), // 星期，注意是0-6
            'H': date.getHours(), // 24小时制
            'h': date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, // 12小时制
            'm': date.getMinutes(), // 分钟
            's': date.getSeconds(), // 秒
            'S': date.getMilliseconds() // 毫秒
        };
        var week = ['日', '月', '火', '水', '木', '金', '土'];
        for (var i in obj) {
            fmt = fmt.replace(new RegExp(i + '+', 'g'), function (m) {
                var val = obj[i] + '';
                if (i == 'w') return (m.length > 2 ? '曜日' : '週') + week[val];
                for (var j = 0, len = val.length; j < m.length - len; j++) val = '0' + val;
                return m.length == 1 ? val : val.substring(val.length - m.length);
            });
        }
        return fmt;
    }
    var initPage = function () {
        canvas.innerHTML = createHTML();
        TagCanvas.Start('myCanvas', '', {
            textColour: null,
            initial: speed(),
            dragControl: 1,
            textHeight: 14
        });
    }
    var spliceString = function (list, title) {
        let txtString = '';
        list.forEach(element => {
            let index = element.indexOf('-');
            let name = '';
            let actNo = '';
            if (index > 0) {
                name = element.substring(0, index);
                actNo = element.substring(index + 1);
            }
            txtString += name + "|" + actNo + "|" + title + "\r\n";
        });
        return txtString;
    }
    var canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;
    document.getElementById('main').appendChild(canvas);
    new Vue({
        el: '#tools',
        data: {
            selected: '参加賞',
            running: false,
            btns: [
                '一等賞', '二等賞', '三等賞', '参加賞'
            ],
            prizeNum: 1,
            lotteryName: '',
            titleActive: false,
            prizeInfo: '',
        },
        mounted() {
            initPage();
        },
        methods: {
            onClick: function (num) {
                this.titleActive = false
                $('#result').css('display', 'none');
                $('#main').removeClass('mask');
                this.selected = num;
            },
            exportData: function () {
                const base64 = (s) => {
                    return window.btoa(unescape(encodeURIComponent(s)));
                }
                const uri = 'data:text/plain;charset=UTF-8;base64,';
                const url = uri + base64(this.prizeInfo);
                window.open(url);
                const a = document.createElement('a');
                let today = formatDate(new Date(), 'yyyyMMdd');
                let fileName = today + '_' + this.selected + '_' + this.prizeNum + '名' + '.txt';
                a.download = fileName;
                a.href = url;
                a.click();
            },
            toggle: function () {
                let prizeNum = this.prizeNum;
                if (prizeNum == '') {
                    alert("当選人数を入力してください");
                    return;
                } else if (prizeNum > maxPrizeNum || prizeNum < 1) {
                    alert("1名から" + maxPrizeNum + "名の当選人数を入力してください！");
                    return;
                }
                // if(this.lotteryName == '') {
                //     alert("请输入抽奖场次！");
                //     return;
                // }
                // 停
                if (this.running) {
                    TagCanvas.SetSpeed('myCanvas', speed());
                    var ret = lottery(prizeNum, this.selected);
                    if (ret.length === 0) {
                        $('#result').css('display', 'block').html('<span>抽選完了</span>');
                        return;
                    }
                    this.titleActive = true;
                    initPage();
                    $('#result').css('display', 'block').html('<span>' + ret.join('</span><span>') + '</span>');
                    TagCanvas.Reload('myCanvas');
                    let retArr = [];
                    ret.forEach(element => {
                        retArr.push(element.replace('<br/>', '-'));
                    });
                    this.prizeInfo = spliceString(retArr, this.selected);
                    setTimeout(function () {
                        localStorage.setItem(new Date().toString(), JSON.stringify(ret));
                        $('#main').addClass('mask');
                    }, 300);
                    // 开始
                } else {
                    $('#result').css('display', 'none');
                    $('#main').removeClass('mask');
                    TagCanvas.SetSpeed('myCanvas', [5, 1]);
                }
                this.running = !this.running;
            },
        }
    });
})();
