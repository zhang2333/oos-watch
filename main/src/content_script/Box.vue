<template>
    <div id="oss-watch" :class="themeClass">
        <transition leave-active-class="animated flipOutY"
            enter-active-class="animated flipInY"
            mode="out-in"
            appear>
            <button class="ow-btn ow-btn-entry"
                @click="start"
                v-if="!isStarted">
                补货通知
            </button>

            <div class="ow-main" v-else="isStarted">
                <h5 class="ow-title">补货通知</h5>
                <hr class="ow-hr">

                <div class="ow-container">
                    <h6 class="ow-title">新建任务</h6>

                    <!-- <ul class="ow-task-list">
                        <li class="ow-task">我是任务1</li>
                    </ul> -->

                    <div class="ow-create-task">
                        <div class="ow-title">款式</div>

                        <ul class="ow-type-list">
                            <li class="ow-type"
                                v-for="(t, i) of types"
                                :class="{ 'ow-active': currentTypeIndex === i }"
                                @click="currentTypeIndex = i"
                                :key="i">
                                <div class="ow-img-box">
                                    <img :src="t.img" :title="t.title" class="ow-img">
                                </div>
                            </li>
                        </ul>

                        <div class="ow-title" v-show="!!sizes.length">尺寸</div>
                        <ul class="ow-size-list">
                            <li class="ow-size"
                                v-for="(s, i) of sizes"
                                :key="i">
                                {{ s.name }}
                            </li>
                        </ul>

                    </div>

                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import * as mock from './mock'
import * as emitter from './emitter'

export default {
    name: 'Box',

    data() {
        return {
            // states
            themeName: 'tb',
            isStarted: false,

            // data
            types: mock.types,
            currentTypeIndex: -1,
        }
    },

    computed: {
        themeClass() {
            return 'theme-' + this.themeName
        },

        sizes() {
            const i = this.currentTypeIndex
            return i >= 0 ? this.types[i].sizes : []
        },
    },

    methods: {
        start() {
            this.isStarted = true
        },
    },

    created() {
        emitter.on('inject-themeName', (name) => {
            this.themeName = name
        })
    }
}
</script>

<style lang="stylus" src="./style.styl"></style>
