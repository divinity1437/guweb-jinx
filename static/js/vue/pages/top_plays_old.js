var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

Vue.use(window.VueTimeago);
new Vue({
    el: "#TopPlays",
    delimiters: ["<%", "%>"],
    data(){
        return{
            mode: 0,
            plays: [],
            period: "all"
        }
    },
    watch:{
        mode(){
            this.getPlays();
        },
        period(){
            this.getPlays();
        }
    },
    created(){
        this.getPlays();
    },
    methods:{
        getPlays(){
            var vm = this;
            this.$axios.get("https://web.archive.org/web/20201120175007/https://api.gatari.pw/top_scores", { params:{
                mode: this.mode,
                period: this.period
            }}).then(function(response){
                vm.plays = response.data.result;
            });
            
        },
        formatDate: function(unix){
            var date = new Date(unix * 1000);
            return date.toLocaleString();
        }
    }
});

}
/*
     FILE ARCHIVED ON 17:50:07 Nov 20, 2020 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 22:38:28 May 13, 2021.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  LoadShardBlock: 60.33 (3)
  cdx.remote: 0.119
  exclusion.robots.policy: 0.393
  PetaboxLoader3.datanode: 251.676 (5)
  exclusion.robots: 0.412
  PetaboxLoader3.resolve: 46.974
  esindex: 0.018
  load_resource: 295.434 (2)
  CDXLines.iter: 19.376 (3)
  captures_list: 113.795
*/