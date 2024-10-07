import express from 'express';
import { getProducts, getCustomers,getWorker,changeUserRole, deleteUser,registerUser,loginUser,registerCustomer, } from '../controllers/client.js'

const router= express.Router()
    

router.get('/products',getProducts)
router.get('/customers',getCustomers)
router.get('/worker',getWorker)

// Route to update the role of a user
router.put('/worker/:id/role', changeUserRole);

// Route to delete a user
router.delete('/worker/:id', deleteUser);

//register
router.post('/register',registerUser)

//login
router.post('/login',loginUser)

// Register a customer
router.post('/registercustomer', registerCustomer);


router.get('/user', (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json("Not Authenticated");
    }
  });
  
export default router