new Vue({
    el: "#leaderboard",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            leaderboard: {},
            lbType: "",
            mode: 0,
            modeText: "osu",
            page: 1,
            country: "",
            load: true
        }
    },
    created() {
        var vm = this;
        vm.mode = vm.convertMode(mode);
        vm.page = page;
        vm.country = country;
        vm.LoadLeaderboard(sort, vm.mode, vm.page, vm.country);
    },
    methods: {
        LoadLeaderboard(lbType = "pp", mode = -1, page = 1, country) {
            if (window.event) {
                window.event.preventDefault();
            }
            var vm = this;
            if (vm.lbType == lbType && vm.mode == mode && page == vm.page && vm.country == country) return;
            if (mode == -1) mode = vm.mode;
            vm.mode = mode;
            vm.modeText = vm.convertModeToText(mode);
            if (lbType != "")
                vm.lbType = lbType;
            vm.load = true;

            if (country != null)
                vm.country = country;
            //vm.leaderboard = {};

            //https://api.okayu.me/get_leaderboard?mode=0&sort=pp&limit=50
            var wl = window.location;
            window.history.replaceState('', document.title, "/leaderboard/" + vm.modeText + "/" + vm.lbType + (page > 1 ? "/" + page : '') + (vm.country != "" ? "?country=" + vm.country : "") + wl.hash);
            this.$axios.get("https://api.okayu.me/get_leaderboard" , { params: { mode: mode,sort:"pp", limit: 50, country: vm.country } })
                .then(function(response) {
                    vm.page = page;
                    vm.leaderboard = response.data.leaderboard;
                    vm.load = false;
                });
        },
        scoreFormat(score) {
            var addCommas = this.addCommas;
            if (score > 1000 * 1000) {
                if (score > 1000 * 1000 * 1000)
                    return addCommas((score / 1000000000).toFixed(2)) + " billion";
                return addCommas((score / 1000000).toFixed(2)) + " million";
            }
            return addCommas(score);
        },
        convertMode(mode) {
            var result;
            switch (mode) {
                default:
                    case "osu":
                    result = 0;
                break;
                case "taiko":
                        result = 1;
                    break;
                case "ctb":
                        result = 2;
                    break;
                case "mania":
                        result = 3;
                    break;
            }
            return result;
        },
        convertModeToText(mode) {
            var result;
            switch (mode) {
                default:
                    case 0:
                    result = "osu";
                break;
                case 1:
                        result = "taiko";
                    break;
                case 2:
                        result = "ctb";
                    break;
                case 3:
                        result = "mania";
                    break;
            }
            return result;
        },
        addCommas(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        specialLink(s) {
            if (s == "rx") {
                return "/rx";
            }
            if (s == "ap") {
                return "/ap";
            }
            return "";
        }
    },
    computed: {
        prevPagesArray: function() {
            return new Array(Number(this.page) + 4 - (this.page < 4 ? (4 - this.page) : 0));
        },
        nextPagesArray: function() {
            if (this.leaderboard.length < 50) {
                return []
            }
            if (this.page > 197) {
                return new Array(Number(this.page) + 4 + (this.page < 3 ? (3 - this.page) : 0)).slice(0, 197 - this.page);
            }
            return new Array(Number(this.page) + 4 + (this.page < 3 ? (3 - this.page) : 0));
        }
    }
});