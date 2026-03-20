 const asyncHandler = (requesthandler) => {
    return (req,res,next) =>{
        Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
    }
 }






export { asyncHandler }

// const asyncHandler = () => () => {}

// const asyncHandler = (funct) =>asynch () => {}

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {//wrapper function
//         await fn(req,res,next)
//     } catch (error) {
//       res.status(error.code || 500).json({
//         success:false,
//         message:err.message 
//     })
//   }
// } 
