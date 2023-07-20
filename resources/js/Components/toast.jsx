import { ToastContainer } from "react-toastify"

export const ToastApp=(props)=>{
    return (
        <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar
            newestOnTop={false}
            closeButton={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="colored"
            limit={1}
        />
    )
}