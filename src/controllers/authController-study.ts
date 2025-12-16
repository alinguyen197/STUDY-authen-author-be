// import { Request, Response, NextFunction } from 'express'
// import authService from '../services/authServices-study'
// import { successResponse, errorResponse } from '../utils/response.common'

// class AuthController {
//   async register(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { email, password, username } = req.body
//       const user = await authService.register(email, password, username)
//       return successResponse(res, user, 'User registered successfully', 201)
//     } catch (error) {
//       next(error)
//     }
//   }

//   async login(req: Request, res: Response, next: NextFunction) {
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

//       // Set refresh token in httpOnly cookie
//       res.cookie('refreshToken', result.refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       })

//       return successResponse(
//         res,
//         {
//           accessToken: result.accessToken,
//           user: result.user,
//         },
//         'Login successful'
//       )
//     } catch (error) {
//       next(error)
//     }
//   }

//   async requestOTP(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { email } = req.body
//       await authService.requestOTP(email)
//       return successResponse(res, null, 'OTP sent to your email')
//     } catch (error) {
//       next(error)
//     }
//   }

//   async verifyOTP(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { email, otp } = req.body
//       const deviceInfo = req.headers['user-agent']
//       const ipAddress = req.ip

//       const result = await authService.verifyOTP(
//         email,
//         otp,
//         deviceInfo,
//         ipAddress
//       )

//       res.cookie('refreshToken', result.refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       })

//       return successResponse(
//         res,
//         {
//           accessToken: result.accessToken,
//           user: result.user,
//         },
//         'OTP verified successfully'
//       )
//     } catch (error) {
//       next(error)
//     }
//   }

//   async refreshToken(req: Request, res: Response, next: NextFunction) {
//     try {
//       const refreshToken = req.cookies.refreshToken || req.body.refreshToken
//       if (!refreshToken) {
//         return errorResponse(res, 'Refresh token required', 401)
//       }

//       const deviceInfo = req.headers['user-agent']
//       const ipAddress = req.ip

//       const result = await authService.refreshToken(
//         refreshToken,
//         deviceInfo,
//         ipAddress
//       )

//       res.cookie('refreshToken', result.refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       })

//       return successResponse(
//         res,
//         {
//           accessToken: result.accessToken,
//         },
//         'Token refreshed successfully'
//       )
//     } catch (error) {
//       next(error)
//     }
//   }

//   async logout(req: Request, res: Response, next: NextFunction) {
//     try {
//       const refreshToken = req.cookies.refreshToken || req.body.refreshToken
//       if (refreshToken) {
//         await authService.logout(refreshToken)
//       }

//       res.clearCookie('refreshToken')
//       return successResponse(res, null, 'Logged out successfully')
//     } catch (error) {
//       next(error)
//     }
//   }

//   async logoutAll(req: Request, res: Response, next: NextFunction) {
//     try {
//       const userId = req.user?.userId
//       if (!userId) {
//         return errorResponse(res, 'Unauthorized', 401)
//       }

//       await authService.logoutAll(userId)
//       res.clearCookie('refreshToken')
//       return successResponse(res, null, 'Logged out from all devices')
//     } catch (error) {
//       next(error)
//     }
//   }
// }

// export default new AuthController()
