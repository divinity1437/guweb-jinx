Vue.use(window.VueTimeago);
new Vue({
    delimiters: ["<%", "%>"],
    el: "#Profile" + userID,
    name: 'Profile',
    data() { return { statsLoading: true, isDruzhban: isDruzhban, userID: userID, reportWindow: false, userState: null, actionText: "", actionIcon: "", userStats: [{}, {}, {}, {}], favourites: [], userpage: null, userSilences: [], achievements: [], events: [], scores: [], rank_maps: [], special: special, currentPage: { best: 1, recent: 1, first: 1, favs: 1, fav: 1, most: 1, events: 1, ranks: 1 }, mostPlaysCount: [0, 0, 0, 0], showFailed: false, mode: mode, modeText: 'osu', userToken: (token ? token : null), isMyProfile: (myUserId ? userID == myUserId : false), mods: { best: -1, first: -1 }, reportComment: "", reportStatus: 0, ppFilter: 1, newppFilter: 1, restrictWindow: false, currentTab: "general" } },
    beforeMount() { for (var i = 0; i < 4; i++) { this.scores.push({ best: [], recent: [], first: [], favs: [], most: [] }); } },
    computed: {
        displayedPP() {
            var u = 'pp';
            if (this.special > 0)
                u = 'pp_' + specialToStr(this.special)
            pp = this.userStats[this.mode][u];
            if (!pp) { return "--" }
            return this.addCommas(pp) + "pp";
        },
        displayedRank() {
            var u = 'rank';
            if (this.special > 0)
                u = 'rank_' + specialToStr(this.special)
            rank = this.userStats[this.mode][u];
            if (!rank) { return "" }
            return "(#" + this.addCommas(rank) + ")";
        },
        favsCount() { return this.scores[this.mode]["favs"].length }
    },
    created() {
        var vm = this;
        this.getStats(this.mode, function() {
            vm.statsLoading = false;
            setTimeout(() => { $('[data-toggle="tooltip"]').tooltip(); }, 200);
            vm.getCharts();
        });
        this.getEvents();
        this.loadScores(this.mode);
        this.getViolations();
        onLoad();
        $(document).ready(function() {
            vm.initBoxes();
            $('#mobile-menu').on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {
                var target = e.target[clickedIndex];
                var tab = target.dataset["tab"];
                vm.changeTab(tab);
                $("a[data-toggle='tab'][href='" + target.value + "']").tab('show');
                var pos = $(".tab-content").offset();
                window.scrollTo(0, pos["top"] - 106);
            });
            vm.fetchState();
            if (document.documentElement.clientWidth >= 992 && document.documentElement.clientHeight > 860)
                $('#prof-left').scrollToFixed();
        });
        setTimeout(this.lazyLoad, 300);
        var i = setInterval(this.fetchState, 3000);
        window.intervals.push(i);
    },
    watch: {
        ppFilter() {
            this.showFailed = false;
            this.currentPage['recent'] = 1;
            this.scores[this.mode]['recent'] = null;
            this.getScores("recent", this.mode);
        },
        showFailed() {
            this.ppFilter = 1;
            var sl = $("#pp-slider")[0];
            if (sl != undefined && sl.noUiSlider != undefined) { sl.noUiSlider.reset(); }
            this.currentPage['recent'] = 1;
            this.scores[this.mode]['recent'] = null;
            this.getScores("recent", this.mode);
        }
    },
    methods: {
        lazyLoad() {
            for (var i = 0; i < 4; i++) {
                if (i != this.mode) {
                    this.getStats(i);
                    this.loadScores(i);
                }
            }
        },
        loadScores(mode) { this.getScores("favs", mode); },
        getMostPlays(mode) {
            var vm = this;
            this.axiosGet(API + "/api/user/mostplays", { id: this.userID, mode: mode, token: this.userToken, page: this.currentPage["most"], special: this.special, }).then(function(response) {
                vm.scores[mode]["most"] = vm.scores[mode]["most"].concat(response.data.result);
                vm.mostPlaysCount[mode] = response.data.count;
                setTimeout(function() { hoverEvent(); }, 500);
            });
        },
        getStats(mode, callback) {
            var vm = this;
            this.axiosGet(API + "/api/user/stats", { id: this.userID, mode: mode, token: this.userToken }).then(function(response) { vm.userStats[mode] = response.data.stats; if (callback) { return callback(); } });
            return true;
        },
        fetchState() {
            var vm = this;
            this.axiosGet("https://c.gatari.pw/api/v1/userState", { id: this.userID }).then(function(response) {
                if (vm.userState == null || response.data.result == null || (vm.userState.beatmapID != response.data.result.beatmapID || vm.userState.actionID != response.data.result.actionID)) {
                    $('.popover').remove();
                    vm.userState = response.data.result;
                    if (vm.userState != null) {
                        vm.actionText = vm.getActionText(vm.userState.actionID);
                        setTimeout(function() { $("[data-toggle=popover]").popover(); }, 200);
                    }
                }
            });
        },
        getScores(order, mode) {
            var vm = this;
            this.axiosGet(API + "/api/user/scores/" + order, { id: this.userID, l: 20, p: this.currentPage[order], mode: mode, f: (this.showFailed ? 1 : 0), token: this.userToken, mods: this.mods[order], ppFilter: this.ppFilter, special: this.special }).then(function(response) {
                if (vm.scores[mode][order] == null && response.data.scores.length > 0) vm.scores[mode][order] = response.data.scores;
                else if (vm.scores[mode][order] != null) vm.scores[mode][order] = vm.scores[mode][order].concat(response.data.scores);
                if (order == "first") { vm.userStats[mode]['firstCount'] = response.data.count; }
                if (order == "best" && mode == vm.mode) {
                    setTimeout(function() { $('[data-toggle="tooltip"]').tooltip() }, 200);
                    setTimeout(function() { vm.initSlider() }, 600);
                }
                setTimeout(function() {
                    $("[data-toggle=popover]").popover();
                    hoverEvent();
                }, 500);
            });
        },
        getFavs() {
            if (this.favourites.length != 8 * (this.currentPage['fav'] - 1)) { return; }
            var vm = this;
            this.axiosGet("https://api.gatari.pw/user/favs", { id: this.userID, p: this.currentPage['fav'], token: this.userToken }).then(function(response) {
                vm.favourites = vm.favourites.concat(response.data.result);
                vm.currentPage['fav'] += 1;
            });
        },
        getRanks() {
            if (this.rank_maps.length != 8 * (this.currentPage['ranks'] - 1)) { return; }
            var vm = this;
            this.axiosGet("https://api.gatari.pw/user/ranks", { id: this.userID, p: this.currentPage['ranks'], token: this.userToken }).then(function(response) {
                vm.rank_maps = vm.rank_maps.concat(response.data.result);
                vm.currentPage['ranks'] += 1;
            });
        },
        axiosGet(URL, params) { var request = this.$axios.get(URL, { params: params }); return request; },
        changeMode(mode, special = 0) {
            var vm = this;
            if (mode >= 0 && mode < 4 && (this.mode != mode || this.special != special)) {
                if (vm.showFailed == true) {
                    vm.showFailed = false;
                    $("#failswitcher").prop("checked", false);
                }
                setTimeout(() => {
                    var wl = window.location;
                    var force = false;
                    if (this.special != special) {
                        force = true;
                        vm.special = special;
                        window.history.replaceState('', document.title, "/u/" + userID + (special > 0 ? "/" + specialToStr(special) : '') + "?m=" + mode + wl.hash);
                    } else { window.history.replaceState('', document.title, "/u/" + userID + "?m=" + mode + wl.hash); }
                    vm.mode = mode;
                    vm.resetPages(force);
                    vm.changeTab(vm.currentTab);
                    vm.modeText = vm.convertMode(mode)
                    setTimeout(() => { $('[data-toggle="tooltip"]').tooltip(); }, 300);
                    vm.getEvents();
                    if (vm.userStats[mode]['pp'] > 0) { vm.getCharts(); }
                    if (!isPrivate) {
                        vm.getAchievements();
                        vm.initSlider();
                    }
                }, 50);
            }
        },
        resetPages(force = false) {
            var vm = this;
            var orders = ["best", "recent", "first", "most", "fav", "events"];
            orders.forEach((value) => { vm.currentPage[value] = 1; if (force && value != "favs") { vm.scores[vm.mode][value] = []; } });
            vm.events = [];
        },
        nextPage(order) {
            if (this.scores[this.mode][order].length != 20 * this.currentPage[order]) { return; }
            this.currentPage[order] += 1;
            this.getScores(order, this.mode);
            if (order == "best" && this.currentPage[order] == 5) { this.currentPage[order] += 1; }
        },
        nextEvents() {
            if (this.currentPage["events"] * 5 != this.events.length) { return; }
            this.currentPage["events"] += 1;
            this.getEvents();
        },
        nextMost() {
            if (this.currentPage["most"] * 6 != this.scores[this.mode]["most"].length) { return; }
            this.currentPage["most"] += 1;
            this.getMostPlays(this.mode);
        },
        getViolations() {
            var vm = this;
            this.axiosGet(API + "/api/user/violations", { id: this.userID, token: this.userToken }).then(function(response) { vm.userSilences = response.data.result; });
        },
        getAchievements() {
            var vm = this;
            this.axiosGet("https://api.gatari.pw/user/achievements", { u: this.userID, token: this.userToken, m: this.mode }).then(function(response) { vm.achievements = response.data.data; });
        },
        getEvents() {
            var vm = this;
            this.axiosGet("https://api.gatari.pw/user/events", { u: this.userID, token: this.userToken, mode: this.mode, p: this.currentPage["events"] }).then(function(response) {
                if (vm.events == null && response.data.data.length > 0) vm.events = response.data.data;
                else if (vm.events != null) vm.events = vm.events.concat(response.data.data);
                setTimeout(function() {
                    $("[data-toggle=popover]").popover();
                    hoverEvent();
                }, 150);
            });
        },
        getCharts() {
            var vm = this;

            this.axiosGet("https://c.skyloc.tk/api/user/charts", { u: this.userID, token: this.userToken, mode: this.mode, special: this.special }).then(function(response) { vm.initCharts(response.data); });
            
        },
        initCharts: function(charts) {
            var vm = this;
            var chart;
            var highLimit = charts["high_limit"];
            var lowLimit = charts["low_limit"];
            var ValueTicks = charts["value_ticks"];
            nv.addGraph(function() {
                chart = nv.models.lineChart().options({ margin: { left: 80, bottom: 45 }, x: function(d) { return d[0] }, y: function(d) { return d[1] }, showXAxis: true, showYAxis: true });
                chart.xAxis.axisLabel("Days").tickFormat(function(d) { if (d == 0) return "now"; return -d + " days ago"; });
                chart.yAxis.axisLabel('Performance').tickFormat(function(d) { if (!d || d == 0) return "-"; return d + "pp"; });
                chart.yScale(d3.scale.log().clamp(true));
                chart.forceY([highLimit, lowLimit]);
                chart.yAxis.tickValues(ValueTicks);
                chart.xAxis.tickValues([-60, -45, -30, -15, 0]);
                chart.forceX([-31, 0]);
                chart.legend.updateState(false);
                chart.interpolate("basis");
                d3.selectAll("#chart1 svg>*").remove();
                var svg = d3.select('#chart1 svg');
                svg.datum([{ area: false, values: charts["data"], key: "Performance", color: "#555", size: 6 }, ]).call(chart);
                return chart;
            });
        },
        getPlayTimeString() {
            var time = this.userStats[this.mode]['playtime'];
            var hrs = ~~(time / 3600);
            var mins = ~~((time % 3600) / 60);
            var secs = ~~time % 60;
            var ret = '<a class="hours-sm-text">';
            if (hrs > 0) { ret = "" + hrs + 'hrs <a class="hours-sm-text">' + (mins < 10 ? "0" : ""); }
            ret += "" + mins + "mins " + (secs < 10 ? "0" : "");
            ret += "" + secs + "secs </a>";
            return ret;
        },
        addRemoveFriend() {
            this.$axios.post("/addremovefriend", { userID: this.userID }).then(function(response) {
                var results = ["", "friend", "mutual"];
                $("#addfriend-btn").attr("class", "follow " + results[response.data.result]);
            });
        },
        applyMods(sort, mods) {
            if (mods == 0) {
                if (this.mods[sort] == 0)
                    this.mods[sort] = -1;
                else
                    this.mods[sort] = 0;
            } else if (this.mods[sort] >= 0 && ((this.mods[sort] & mods) > 0)) { this.mods[sort] -= mods; if (this.mods[sort] == 0) { this.mods[sort] = -1; } } else {
                if (this.mods[sort] == -1) this.mods[sort] = mods;
                else this.mods[sort] += mods;
            }
            this.currentPage[sort] = 1;
            this.scores[this.mode][sort] = null;
            this.getScores(sort, this.mode);
        },
        submitReport() {
            var formData = new FormData();
            formData.append("target", userID);
            formData.append("reason", $("select#reasonpicker").val());
            formData.append("comment", this.reportComment);
            var vm = this;
            this.$axios.post("/report", formData).then(function(response) {
                if (response.data == "200") {
                    vm.reportStatus = 1;
                    setTimeout(() => { vm.reportWindow = false }, 3000);
                }
            });
        },
        restrict() {
            var form = new FormData();
            form.append("target", userID);
            form.append("notes", $("#restrict_note").val());
            form.append("nullify", $("#nullifypicker").val());
            this.$axios.post("/user/restrict", form).then(function(response) { location.reload(); });
        },
        unrestrict() {
            var r = confirm("Are you sure?");
            if (r == true) {
                var form = new FormData();
                form.append("target", userID);
                this.$axios.post("/user/unrestrict", form).then(function(response) { location.reload(); });
            }
        },
        initSlider() {
            var vm = this;
            var sl = $("#pp-slider")[0];
            if (vm.scores[vm.mode]["best"] == null || vm.scores[vm.mode]["best"].length == 0) { return; }
            var topPP = vm.scores[vm.mode]["best"][0]["pp"];
            if (topPP < 5) { $(sl).hide(); return; }
            var max = Math.round(topPP - (topPP / 20))
            $(sl).show();
            var step = Math.max(2, Math.round(topPP / 20))
            try {
                sl.noUiSlider.reset();
                sl.noUiSlider.updateOptions({ step: step, range: { 'min': [1], 'max': [max] } });
            } catch (e) {
                noUiSlider.create(sl, {
                    start: [1],
                    step: step,
                    connect: [true, false],
                    range: { min: [1], max: [max], },
                    tooltips: [true],
                    format: {
                        to: function(value) {
                            value = Math.round(value);
                            vm.newppFilter = value;
                            if (value == 1) { return "any" }
                            return value + "pp+";
                        },
                        from: function() { return "1" }
                    }
                });
            }
        },
        DateFormat(time) { var data = new Date(time).toLocaleString(); return data; },
        MakeFavScore: function(scoreID, order, score_index) {
            var vm = this;
            this.$axios.get("https://api.gatari.pw/scores/set_favourite", { params: { mode: this.mode, score: scoreID, token: this.userToken } }).then(function(response) {
                var isfav = response.data.result != -1;
                var curScore = vm.scores[vm.mode][order][score_index];
                var orders = ["recent", "best", "first"];
                orders.forEach((val) => { var index = vm.findScore(scoreID, val); if (index != -1) { vm.scores[vm.mode][val][index].isfav = isfav; } })
                curScore.isfav = isfav;
                if (isfav == true) { vm.scores[vm.mode]["favs"].push(curScore); } else {
                    var index = vm.findScore(scoreID, "favs")
                    if (index != -1) { vm.scores[vm.mode]["favs"].splice(index, 1); }
                }
            });
        },
        findScore(scoreID, table) {
            var index = -1;
            this.scores[this.mode][table].forEach((scr, idx) => { if (scr.id == scoreID) { index = idx; } });
            return index;
        },
        changeTab(order) {
            this.currentTab = order;
            if (order == "achievements") { this.getAchievements(); return; }
            if (order == "general") { return; }
            var mode = this.mode;
            if (order == "most") {
                if (this.scores[mode]["most"].length == 0) { this.getMostPlays(mode); }
                if (this.rank_maps.length == 0)
                    this.getRanks();
                if (this.favourites.length == 0)
                    this.getFavs();
            } else {
                if (this.scores[mode][order].length != 0 && this.scores[mode][order] != null) { return; }
                this.getScores(order, mode)
            }
        },
        getActionText(actionID) {
            var vm = this;
            vm.actionIcon = "";
            switch (actionID) {
                case 1:
                    vm.actionIcon = "far fa-snooze";
                    return "AFK";
                case 3:
                case 4:
                    vm.actionIcon = "fa fa-paint-brush";
                    return "Editing";
                case 6:
                    vm.actionIcon = "fa fa-eye";
                    return "Watching";
                case 2:
                case 8:
                case 10:
                case 3:
                    vm.actionIcon = "fa fa-play-circle";
                    return "Playing";
                case 12:
                    vm.actionIcon = "fas fa-gamepad-alt";
                    return "Multiplaying";
                case 5:
                    vm.actionIcon = "fa fa-comment-dots";
                    return "Multi idle";
                default:
                    vm.actionIcon = "fa fa-ellipsis-h";
                    return "Idle";
            }
        },
        actionToClass(actionID) {
            if (actionID == 12 || actionID == 5) { return "multi"; }
            return this.actionText.toLowerCase();
        },
        isNonIdleAction(actionID) { return [2, 6, 8, 10, 12].indexOf(actionID) > -1; }
    }
});

function specialToStr(s) {
    if (s == 1) { return "rx"; }
    if (s == 2) { return "ap"; }
    return "";
}