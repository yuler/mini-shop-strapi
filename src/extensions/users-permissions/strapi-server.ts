export default function (plugin: any) {
	// Add miniprogram auth
	plugin.controllers.auth.miniprogram = async (ctx: any) => {
		ctx.response.send('xxx')
		// ctx.request.body.confirmed = false
		// const token = ctx.request.body.token
		// const gres = await axios.post(
		// 	`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_SITEKEY}&response=${token}`
		// )
		// console.log(gres.data)
		// if (!gres.data.success) {
		// 	return ctx.badRequest(
		// 		null,
		// 		formatError({
		// 			id: 'Auth.form.error.token.provide',
		// 			message: 'Please provide a valid token.',
		// 		})
		// 	)
		// }
		// await register(ctx)
	}
	return plugin
}
