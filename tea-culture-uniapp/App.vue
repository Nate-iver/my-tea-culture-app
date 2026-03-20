<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 1. 引入 uView-plus 核心样式 */
		@import "uview-plus/index.scss";
		
		/* 2. 你的其他全局样式 */
		.container {
			background-color: #f5f7f9;
		}
</style>
