import {
  ref
} from 'vue'

// Firebase Imports
import {
  firebaseAuth
} from '../firebase/config.js'
import {
  signInWithEmailAndPassword
} from 'firebase/auth'

// firebase imports
import { firestoreDB } from "../firebase/config";
import { getDoc, doc } from "firebase/firestore";

import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css';

const error = ref(null);
const isPending = ref(false);
const userObj = ref({});
const profileExistence = ref(false);

const login = async (email, password) => {
  isPending.value = true
  error.value = null
  profileExistence.value = false;
  
  try {
    const res = await signInWithEmailAndPassword(firebaseAuth, email, password)
    
    if (!res) {
      throw new Error('Error signing in')
    }
    const userUidPath = "users/" + res.user.uid;
    const userRef = doc(firestoreDB, userUidPath);
    const userProfileSnap =  await getDoc(userRef);

    if(userProfileSnap.exists()){
     
      userObj.value = userProfileSnap.data();
      profileExistence.value = true;
    }
    

    isPending.value = false
    error.value = null

  } catch (e) {
    error.value = e.message
    // console.log(error.value)
    isPending.value = false

    Swal.fire({
      title: 'Error',
      text: e.message,
      icon: 'error',
      confirmButtonText: 'Okay',
      confirmButtonColor: '#3938f4',
    })
  }

}

const userlogin = () => {
  return {
    error,
    isPending,
    profileExistence,
    userObj,
    login
  }
}

export default userlogin