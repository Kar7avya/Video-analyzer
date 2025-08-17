// import React,{useState} from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import supabase from"./supabaseClient";

// const SignUp = () =>{

//     const navigate = useNavigate();

//     const [formData,setFormData] =useState({
//         fullname:'',
//         email:'',
//         password:''

//     });

//     console.log("FORM",formData);

//     function handleChange(event){

//         setFormData((prevFormData)=>{
//             return{
//                 ...prevFormData,
//                 [event.target.name]:event.target.value
//             }
//         });
//     }

//     async function handleSubmit(e){

//         e.preventDefault()

//         try {

//             const{data,error} = await supabase.auth.signUp(
//             {
//                 email:formData.email,
//                 password: formData.password,
//                 options:{
//                     data:{
//                         first_name:formData.fullname,
                    
//                     }
//                 }
//             }
//         )

//         toast.success('Check your email for verification link');
            
//         } catch (error) {
//             toast.error('An error occurred during signup');
//             console.error('Signup error:', error);
//         }



//     }

//     // function handleSubmit(event) {
//     //     event.preventDefault(); // Prevent page reload
        
//     //     // Basic validation
//     //     if (!formData.fullname || !formData.email || !formData.password) {
//     //         toast.error('Please fill in all fields');
//     //         return;
//     //     }

//     //     // Here you would typically make an API call to register the user
//     //     console.log('Submitting:', formData);

//     //     toast.success('Account created successfully!');
        
//     //     // Navigate to home page after successful signup
//     //     setTimeout(() => {
//     //         navigate('/');
//     //     }, 2000); // Wait 2 seconds to show success message
//     // }

//     return(
//         <div >
//             <h2>SignUp</h2>
//         <form onSubmit={handleSubmit}>
//             <input
//             placeholder='Fullname'
//             name='fullName'
//             onChange={handleChange}
//             />

//             <input
//             placeholder='Email'
//             name='email'
//             onChange={handleChange}
//             />

//             <input
//             placeholder='Password'
//             name='password'
//             onChange={handleChange}
//             />

//             <button type ='submit' >
//                 Submit
//             </button>


//         </form>
//         </div>
//     )
// }

// export default SignUp;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import supabase from "./supabaseClient";

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);

    console.log("FORM", formData);

    function handleChange(event) {
        setFormData((prevFormData) => {
            return {
                ...prevFormData,
                [event.target.name]: event.target.value
            }
        });
    }

    async function handleSubmit(e) {  // ✅ Fixed: Added 'e' parameter
        e.preventDefault();

        // Basic validation
        if (!formData.fullname || !formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullname, // ✅ Better naming
                    }
                }
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success('Check your email for verification link');
            
            // Navigate to login or home after successful signup
            navigate('/home');
            
            console.log('Navigation called to /home');

        } catch (error) {
            toast.error('An error occurred during signup');
            console.error('Signup error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem' }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder='Full Name'
                    name='fullname'  // ✅ Fixed: matches formData property
                    value={formData.fullname}
                    onChange={handleChange}
                    style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }}
                    required
                />

                <input
                    placeholder='Email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleChange}
                    style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }}
                    required
                />

                <input
                    placeholder='Password'
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={handleChange}
                    style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }}
                    required
                />

                <button 
                    type='submit' 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
        </div>
    );
}

export default SignUp;