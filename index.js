const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');

require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json())

const db = monk(process.env.DB_URL)
const crud = db.get('crud')
db.then(() => {
    console.log('Mongo Connected')
}).catch(e => {
    console.log(e)
})

const schema = Joi.object({
    todo: Joi.string().min(3).required()
})


//Read All
app.get('/', (req, res) => {
    crud.find().then(crud => {
        res.json(crud)
    }).catch((e)=>{
        res.json(e)
    })

})

//Read One
app.get('/:id', async (req, res) => {
    const { id } = req.params;
    const item = await crud.findOne({
        _id: id,
    })
    if(!item){
        res.json({
            message: "Item not found"
        })
    }
    else{
        res.json(item);
    }
})

//Create One
app.post('/', (req, res) => {
    const {error} =  schema.validate(req.body)
    if(error){
        res.status(400).json(error)
    }
    else{
        const data = {
            todo: req.body.todo
        }
        crud.insert(data).then(insertedData => {
            res.json(insertedData)
        }).catch(e => {
            res.json(e)
        })
    }
})

//Update One
app.put('/:id', async (req, res) => {
    const {error} =  schema.validate(req.body)
    
    const { id } = req.params;
    if(error){
        res.status(400).json(error)
    }
    else{
        const data = {
            todo: req.body.todo
        }
        const item = await crud.findOne({
            _id: id
        })
        if(item){
            crud.update({
                _id: id
            },{
                $set: data
            })
            .then(res.json(data))
            .catch(e => {
                res.json(e)
            })
        }
        
    }
})

//Delete One
app.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await crud.remove({_id: id})
    res.status(200).send('Success')
})

app.listen(port, () => {
    console.log(`Listening on Port: ${port}`);
})