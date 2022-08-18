Vue.component('achievement',{name:'achievement',props:['data','source','index'],template:`
    <div v-if="data" class="achieve-single" :class="{ 'profile': source, 'disabled': !data.enable}">
        <img :src="'/static/achievements/'+data.icon+'.png'" class="achieve-single--img">
        <div :class="['achieve-dropdown dropdown-conor-'+data.color, {'top-dropdown': index >= 16}]">
            <div :class="'achieve-dropdown--header drop-header--'+data.color">
                <div class="achievement-bg"></div>
                <img :src="'/static/achievements/'+data.icon+'.png'" class="achieve-single--img header-achieve--img">
            </div>
            <div class="drop-text-content">
                <div class="drop-header-text1">
                    {{ data.name }}
                </div>
                <div v-if="data.enable" class="drop-header-text2">
                    {{ data.description }}
                </div>
            </div>
            <div v-if="data.enable" class="drop-header-text3">
                {{ T('Achieved on') }} <b> {{ DateFormat(data.time) }} </b>
            </div>
        </div>
    </div>`,methods:{T(str){return T(str);},DateFormat(time){let data=new Date(time*1000);return data.toLocaleDateString(lang,{year:'numeric',month:'long',day:'numeric'});}}});