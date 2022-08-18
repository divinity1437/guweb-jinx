Vue.use(window.VueTimeago);
new Vue({
    el:"#beatmap"+beatmapSetID,
    delimiters: ["<%","%>"],
    data(){
        return{
            userID: myUserId,
            beatmapID: -1,
            beatmapSetID: beatmapSetID,
            maps:[],
            stats: {},
            mode: "std",
            scores: [],
            loading: true,
            playing: false,
            csTitle: "Circle Size",
            lbMode: 0,
            disableConv: false,
            favs: favs,
            beatmapHypes: beatmapHypes,
            userHypes: userHypes,
            isFaved: isFaved,
            reportWindow: false,
            reportedUserID: -1,
            reportedScoreID: -1,
            reportComment: "",
            reportedUsername: "",
            reportStatus: 0,
            isHyped: false,
            updating: false,
            ezpp: {
                active: false,
                mods: 0,
                pp: 0,
                acc: 100,
                combo: 0,
                misses: 0,
                stars: 0
            },
            mods_sort: -1,
            userBest: null
            
        }
    },
    watch:{
        lbMode(){
            this.getScores(this.mode);
        },
        mode(mode){
            if (mode == "mania") this.csTitle = "Keys";
            else this.csTitle = "Circle Size";
            var wl = window.location;
            window.history.replaceState('', document.title, "/b/"+ this.beatmapID+"?m="+this.convertMode(mode)+ wl.hash);
            this.getScores(mode);
        },
        beatmapID(map, p){
            $(".map-difficulty.selected").removeClass("selected");
            $("#bm"+map).addClass("selected");
            if (p != -1){
                this.ezpp.pp = 0;
            }

        }
    },
    beforeMount(){
        this.beatmapID = beatmapID;
        if(diffData['mode'] != 0){
            this.mode = this.convertModeToText(diffData['mode']);
            this.disableConv = true;
        }else if(mode > 0){
            this.mode = this.convertModeToText(mode);
        }
        this.maps[this.beatmapID] = diffData;
        this.stats = diffData;
    },
    created(){
        let mapsURL = 'https://api.gatari.pw/beatmaps/get?';
        var vm = this;
        diffs.forEach((b) => { mapsURL += 'bb=' + b + '&' });
        this.$axios.get(mapsURL).then(function(response){
            var mapsData = response.data.data;
            mapsData.forEach((val)=>{
                vm.maps[val["beatmap_id"]] = val;
            });
            vm.fixDiffs();
            // vm.calculatePP();
            vm.getScores(vm.mode);
        });

    },
    methods:{
        report(userID, username, scoreID){
            this.reportedUsername = username;
            this.reportedUserID = userID;
            this.reportedScoreID = scoreID
            this.reportWindow = true;
            
        },
        submitReport(){
            var formData = new FormData();
            formData.append("target", this.reportedUserID);
            formData.append("reason", 0);
            formData.append("comment", this.reportComment+"\nBeatmap: https://osu.gatari.pw/b/"+this.beatmapID+"\nScore: https://osu.gatari.pw/replay/"+this.reportedScoreID);
            var vm = this;
            this.$axios.post("/report", formData).then(function(response){
                if (response.data == "200"){
                    vm.reportStatus = 1;
                    vm.reportComment = "";
                    setTimeout(()=> {vm.reportWindow = false}, 3000);
                }
            });
        },
        update(){
            var vm = this;
            this.updating = true;
            var f = new FormData();
            f.append('sid', beatmapSetID);
            f.append('refresh', 1);
            this.$axios.post("/letsapi/v1/cacheBeatmap", f).then(function(response){
                location.reload();
            });
        },
        hype(){
            if (this.isHyped) return;
            var vm = this;
            this.$axios.post("/beatmap/hype", { beatmapset_id: beatmapSetID }).then(function(response){
                if (response.data.code == 200){
                    $(".hype-line:not(.active):first").addClass("active");
                    vm.userHypes = response.data['user_hypes'];
                    vm.beatmapHypes = response.data['beatmap_hypes'];
                    $("#hype-button").addClass("disabled");
                    vm.isHyped = true;
                }
            });
        },
        calculatePP(){
            var vm = this;
            if(!this.ezpp.active && this.ezpp.pp > 0){
                $('.tooltip, .popover').remove();
                vm.ezpp.active = true;
                return;
            }
            if(this.ezpp.combo == 0){
                this.ezpp.combo = this.stats["max_combo"];
            }
            this.$axios.get("https://osu.gatari.pw/api/v1/pp", {params: {
                b: this.beatmapID,
                a: this.ezpp.acc,
                x: this.ezpp.misses,
                c: this.ezpp.combo,
                m: this.ezpp.mods
            }}).then(function(response){
                if (!vm.ezpp.active){
                    $('.tooltip, .popover').remove();
                    vm.ezpp.active = true;
                }
                vm.ezpp.pp = Math.round(response.data.pp[0]);
                vm.ezpp.stars = response.data.stars.toFixed(2);
            });
            
        },
        applyMods(modsInt){
            if (this.ezpp.mods & modsInt)
                this.ezpp.mods -= modsInt;
            else this.ezpp.mods += modsInt;
            this.calculatePP();
        },
        applySortMods(mods){  
            if (mods == 0){
                if (this.mods_sort == 0)
                    this.mods_sort = -1;
                else
                    this.mods_sort = 0;
                           
            }
            else if (this.mods_sort >= 0 && ((this.mods_sort & mods) > 0)){
                this.mods_sort -= mods;
                if(this.mods_sort == 0) {
                    this.mods_sort = -1;
                }
            }else{
                if(this.mods_sort == -1) this.mods_sort = mods;
                else this.mods_sort += mods;
            }
            this.getScores(this.mode);
        },
        getScores(mode){
            var vm = this;
            if(this.stats == 0){ return; }
            this.$axios.get("https://api.gatari.pw/beatmap/"+this.beatmapID+"/scores", 
            { params: {
                    token: token,
                    mode: this.convertMode(mode),
                    lbMode: this.lbMode,
                    mods: this.mods_sort
                }
            }).then(function(response){
                vm.scores = response.data.data;
                vm.userBest = null;
                if (vm.userID != null && vm.scores.length > 0){
                    var found = false;
                    vm.scores.forEach(function(score, i){
                        if(score.userid == vm.userID){
                            vm.userBest = score;
                            vm.userBest['top'] = i+1;
                            found = true;
                        }
                    });
                    if (!found){
                        vm.$axios.get("https://api.gatari.pw/beatmap/user/score", 
                        { params: {
                                token: token,
                                mode: vm.convertMode(mode),
                                b: vm.beatmapID,
                                m: vm.mods_sort,
                                special: vm.lbMode,
                            }
                        }).then(function(response){
                            vm.userBest = response.data.score;
                        });
                    }
                }
                vm.loading = false;
            });
            
        },
        convertRank(status){
            switch(status){
                case 0:
                    return "Unranked";
                case 2:
                case 3:
                    return "Ranked";
                case 4:
                    return "Qualified";
                case 5:
                    return "Loved";
            }
        },
        changeMap(beatmapID){
            if (window.event){
                window.event.preventDefault();
            }
            if (this.beatmapID == beatmapID){
                return;
            }
            var wl = window.location;
            this.beatmapID = beatmapID;
            window.history.replaceState('', document.title, "/b/"+ beatmapID + wl.hash);
            this.stats = this.maps[beatmapID];
            this.mode = this.convertModeToText(this.stats["mode"]).replace("osu", "std");
            if (this.stats["mode"] == 0){
                this.disableConv = false;
            }else{
                this.disableConv = true;
            }
            this.loading = true;
            this.getScores(this.mode);
        },
        urldecode (str) {
            return decodeURIComponent(unescape(str));
        },
        play(){
            var audioElement = document.getElementsByTagName("audio")[0];
            var vm = this;
            if (audioElement && audioElement.currentTime > 0){
                audioElement.pause();
                audioElement.currentTime = 0;
                audioElement = null;
                if(vm.playing) return;
            }
            if(!audioElement){
                audioElement =  document.createElement('audio');
                window.audioElement = audioElement;
            }
            this.playing = true;
            audioElement.volume=0.4;
            audioElement.play();
            audioElement.addEventListener('ended', function() {
                vm.playing = false;
                audioElement.currentTime = 0;
            }, false);
            audioElement.addEventListener('pause', function() {
                vm.playing = false;
                return;
            }, false);
        },
        fixDiffs(){
            var topPOS = $(".map-difficulty")[0].offsetTop;
            $(".map-difficulty").each((_, val)=>{
                var pos = val.offsetTop;
                if (pos != topPOS){
                    $(val).addClass("diff-rounded");
                }
            });
        },
        favunfav(){
            var vm = this;
            this.$axios.post("/beatmap/favourite", { beatmapset_id: beatmapSetID }).then(function(response){
                vm.favs = response.data['count'];
                vm.isFaved = response.data['status'] == 1;
            });
            
        }
    }
});