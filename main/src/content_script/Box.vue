<template>
    <div id="oss-watch" :class="themeClass">
        <button class="ow-btn ow-btn-entry"
            @click="start"
            v-show="!isStarted">
            补货通知
        </button>

        <div class="ow-main" v-show="isStarted">
            <h5 class="ow-title">补货通知</h5>
            <hr class="ow-hr">
            <div class="ow-container">

                <!-- <ul class="ow-task-list">
                    <li class="ow-task">我是任务1</li>
                </ul> -->

                <div class="ow-create-task">
                    <div class="ow-title">款式</div>

                    <ul class="ow-type-list">
                        <li class="ow-type"
                            v-for="(t, i) of types"
                            :key="i">
                            <div class="ow-img-box">
                                <img :src="t.img" :title="t.title" class="ow-img">
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
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
            isStarted: true,

            // data
            types: mock.types,
        }
    },

    computed: {
        themeClass() {
            return 'theme-' + this.themeName
        }
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
