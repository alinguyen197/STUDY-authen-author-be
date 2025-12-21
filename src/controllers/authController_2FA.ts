// // controllers/auth.controller.ts

// class AuthController {
//   async login(req: Request, res: Response) {
//     try {
//       const { email, password } = req.body
//       const deviceInfo = req.headers['user-agent']
//       const ipAddress = req.ip

//       const result = await authService.login(
//         email,
//         password,
//         deviceInfo,
//         ipAddress
//       )

//       // ✅ Kiểm tra có yêu cầu OTP không
//       if ('requireOTP' in result) {
//         return res.status(200).json({
//           success: true,
//           requireOTP: true,
//           otpId: result.otpId,
//           message: 'OTP has been sent to your email',
//         })
//       }

//       // Không cần OTP → Trả về tokens
//       res.status(200).json({
//         success: true,
//         data: result,
//       })
//     } catch (error: any) {
//       res.status(401).json({
//         success: false,
//         message: error.message,
//       })
//     }
//   }

//   async verifyLoginOTP(req: Request, res: Response) {
//     try {
//       const { otpId, otp } = req.body
//       const deviceInfo = req.headers['user-agent']
//       const ipAddress = req.ip

//       const result = await authService.verifyLoginOTP(
//         otpId,
//         otp,
//         deviceInfo,
//         ipAddress
//       )

//       res.status(200).json({
//         success: true,
//         data: result,
//       })
//     } catch (error: any) {
//       res.status(401).json({
//         success: false,
//         message: error.message,
//       })
//     }
//   }

//   async enable2FA(req: Request, res: Response) {
//     try {
//       const userId = req.user.id // Từ auth middleware

//       await authService.enable2FA(userId)

//       res.status(200).json({
//         success: true,
//         message:
//           'OTP has been sent to your email. Please verify to enable 2FA.',
//       })
//     } catch (error: any) {
//       res.status(400).json({
//         success: false,
//         message: error.message,
//       })
//     }
//   }

//   async verify2FASetup(req: Request, res: Response) {
//     try {
//       const userId = req.user.id
//       const { otp } = req.body

//       await authService.verify2FASetup(userId, otp)

//       res.status(200).json({
//         success: true,
//         message: '2FA enabled successfully',
//       })
//     } catch (error: any) {
//       res.status(400).json({
//         success: false,
//         message: error.message,
//       })
//     }
//   }

//   async disable2FA(req: Request, res: Response) {
//     try {
//       const userId = req.user.id
//       const { password } = req.body

//       await authService.disable2FA(userId, password)

//       res.status(200).json({
//         success: true,
//         message: '2FA disabled successfully',
//       })
//     } catch (error: any) {
//       res.status(400).json({
//         success: false,
//         message: error.message,
//       })
//     }
//   }
// }

// export default new AuthController()
