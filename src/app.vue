<template>
    <div></div>
</template>
<script>
    import webRTCTest from './assets/webRTCTest'
    export default {
        name:'test',
        data () {
            return {}
        },
        props:{},
        methods: {
            getSupport: function (data) {
                this.$emit('getSupport', data)
            }
        },
        created(){
            webRTCTest(this.getSupport)
        }
    }
</script>
