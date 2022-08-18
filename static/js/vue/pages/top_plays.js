Vue.use(window.VueTimeago);
new Vue({
    el: "#TopPlays",
    delimiters: ["<%", "%>"],
    data() {
        return {
            mode: 0,
            plays: [],
            period: "all",
            rxtype: "reg"
        }
    },
    watch: {
        mode() {
            this.getPlays();
        },
        rxtype() {
            this.rxtype();
        },
        period() {
            this.getPlays();
        }
    },
    created() {
        this.getPlays();
    },
    methods: {
        getPlays() {
            var vm = this;
            this.$axios.get(API +"/api/top_plays", {
                params: {
                    mode: this.mode,
                    period: this.period,
                    rxtype: this.rxtype
                }
            }).then(function(response) {
                vm.plays = response.data.result;
            });

        },
        formatDate: function(unix) {
            var date = new Date(unix * 1000);
            return date.toLocaleString();
        }
    }
});