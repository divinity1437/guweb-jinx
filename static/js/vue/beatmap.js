Vue.component('beatmap',{props:['beatmap'],template:`
            <div class="beatmap_block" v-if="beatmap">
            <div class="card hovercard">
            <div class="bg-placeholder"/>
            <a target="_blank" :href="'/s/'+beatmap.beatmapset_id" class="cardheader ranked" :id="beatmap.beatmapset_id" 
            :style="'background-image: url(https://assets.ppy.sh/beatmaps/'+beatmap.beatmapset_id+'/covers/card.jpg);'">
                <div>
                </div>
                <div class="d-flex flex-column">
                    <span class="beatmap songname title">{{ beatmap.title }}</span>
                    <span class="beatmap songname">{{ beatmap.artist }}</span>
                </div>
            </a>
            <div :class="'beatmapset-preview-elapsed-bar '+(playing ? 'ongoing' : '') "></div>
            <div class="info">
                <div class="desc">
                    {{ T("mapped by") }} <a class="song-author-name"> {{ beatmap.creator }}</a>
                </div>
                <div class="play-download">      
                    <a class="download-icon" target="_blank" :href="'/d/'+beatmap.beatmapset_id"><i class="fa fa-download"></i></a>
                </div>
            </div>
            <div class="bottom">
                <template v-for="map in beatmap.beatmaps">
                    <div data-toggle="tooltip" data-html="true" data-placement="top" :title="map.version+'<br><span class='+getDiffIcon(map)+'>'+getDiff(map)[0].toFixed(2)+'<i></i></span>'" v-if="getDiffIcon(map) != '' " :class="'gatari-icon '+getDiffIcon(map)"></div>
                </template>
                
            </div>
        </div>
   
    <span class="beatmapset-panel-prev beatmapset-panel__play">
    <span @click="play()" :class="'fa fa-'+(playing ? 'stop' : 'play')"></span></span>
            </div>
            `,name:'Beatmap',data(){return{playing:false,T:T}},methods:{convertRank(status){switch(status){case 0:return "Unranked";case 2:case 3:return "Ranked";case 4:return "Qualified";case 5:return "Loved";}},addCommas(nStr){nStr+='';var x=nStr.split('.');var x1=x[0];var x2=x.length>1?'.'+x[1]:'';var rgx=/(\d+)(\d{3})/;while(rgx.test(x1)){x1=x1.replace(rgx,'$1'+','+'$2');}
return x1+x2;},getDiff(beatmap){var modes=["std","taiko","ctb","mania"];var mode=modes[beatmap.mode];var diff=parseFloat(beatmap["difficulty_"+mode]);return[diff,mode];},getDiffIcon(beatmap){var vm=this;var d=this.getDiff(beatmap);var diff=d[0];var mode=d[1];if(diff==0)return "";if(diff>=5.25)
result="diff-expert";else if(diff>=3.75)
result="diff-insane";else if(diff>=2.25)
result="diff-hard";else if(diff>=1.5)
result="diff-normal";else if(diff>0)
result="diff-easy";return result+" "+mode+"-diff ";},onFinish:function(){this.playing=false;var id=this.beatmap.beatmapset_id;var audio=$('#audio_'+id)[0];audio.pause();audio.currentTime=0;},play:function(){var audioElement=window.audioElement;var vm=this;if(audioElement&&audioElement.currentTime>0){audioElement.pause();audioElement.currentTime=0;audioElement=null;window.audioElement=null;if(vm.playing){vm.playing=false;return;}}
if(!audioElement){audioElement=document.createElement('audio');window.audioElement=audioElement;}
audioElement.setAttribute('src','https://b.ppy.sh/preview/'+this.beatmap.beatmapset_id+'.mp3');audioElement.addEventListener("loadeddata",function(){if(vm.playing)return;vm.playing=true;audioElement.volume=0.4;audioElement.play();});audioElement.addEventListener('ended',function(){vm.playing=false;window.audioElement=null;},false);audioElement.addEventListener('pause',function(){vm.playing=false;return;},false);}},created(){setTimeout(()=>$('[data-toggle="tooltip"]').tooltip(),100);}});