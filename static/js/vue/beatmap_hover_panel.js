Vue.use(window.VueTimeago);
var panelComponent = {
    props: ['beatmapID', 'panelID'],
    template: `
    <div :data-panel-id="panelID" :data-beatmap-id="beatmapID" class="beatmap_panel">
    <div class="beatmap_panel-background" :style="'background-image: url(https://assets.ppy.sh/beatmaps/'+data.beatmapset_id+'/covers/card.jpg);'"></div>    
        <template v-if="data.difficulty_std">
            <div class="panel_stats">
                <div class="panel_column">
                    <div> Stars: <b>{{ data.difficulty_std.toFixed(2) }}</b> </div>
                    <div> BPM: <b>{{ data.bpm }}</b> </div>
                    <div> Length: <b>{{ secondsToTime(data.total_length) }}</b> </div>
                    <div> Creator: <b>{{ data.creator }}</b> </div>
                </div>    
                <div class="panel_column text-right">
                    <div> AR: <b>{{ data.ar }}</b> </div>
                    <div> OD: <b>{{ data.od }}</b> </div>
                    <div> CS: <b>{{ data.cs }}</b> </div>
                    <div> HP: <b>{{ data.hp }}</b> </div>
                </div>
            </div>
        </template>
    </div>`,
    data(){
        return {
            data: {}
        }
    },
    created(){
        var vm = this;
        if(cachedMaps[vm.beatmapID]){
            vm.data = cachedMaps[vm.beatmapID];
        }else{
            this.$axios.get("https://api.gatari.pw/beatmaps/get", { params: { bb: vm.beatmapID }}).then(function(response){
                vm.data = response.data.data[0];
                cachedMaps[vm.beatmapID] = vm.data;
                saveStorageDelayed('cachedMaps', cachedMaps);
            });
        }

    }
};

$(document).ready(function(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        isMobile = true;
    }
    var hoverEvent = function(){
        $("a[href^='/b/']:not([data-panel-id]):not([target]):not([class]), a[href^='/b/'][class='beatmap-link']:not([data-panel-id]):not([target])").hover(function(event){
                var target;
                try{
                    target = event.currentTarget;
                }catch{
                    target = event.target;
                }
                var beatmapID = target.pathname.split("/b/")[1];   
                if (target.dataset.loadedPanel){
                    $("div.beatmap_panel[data-panel-id]:not([data-panel-id='"+target.dataset.loadedPanel+"'])").hide();
                    $("div.beatmap_panel[data-panel-id='"+target.dataset.loadedPanel+"'][data-beatmap-id='"+ beatmapID +"']").show();
                    return;
                }else{
                    var panelID = randomInt();
                    target.setAttribute("data-loaded-panel", panelID);
                    var panelV = Vue.extend(panelComponent);
                    var panel = new panelV({
                        propsData: {
                            beatmapID: beatmapID,
                            panelID: panelID
                        }
                    }).$mount()
                    target.appendChild(panel.$el);
                }
        }, function(){
            try{
                if(event.fromElement){
                    if(event.fromElement.className == "beatmap_panel"){
                        $(event.fromElement).hide();
                        return;
                    }
                }
                try{
                    target = event.currentTarget;
                }catch{
                    target = event.target;
                }
                var panelID = target.dataset.loadedPanel;
                $("div.beatmap_panel[data-panel-id='"+panelID+"']").hide();
                
            }catch{
                $("div.beatmap_panel[data-panel-id]").hide();
            }

            
        });
    }
    window.hoverEvent = hoverEvent;
    if(!isMobile){
        hoverEvent();
        setTimeout(function(){
            hoverEvent();
        }, 1500);
    }

    
});

function randomInt(){
    return Math.round(Math.random() * 100000000);
}

var isMobile = false;
