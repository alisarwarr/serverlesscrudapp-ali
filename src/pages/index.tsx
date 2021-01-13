import React, { useState, useEffect, useRef } from 'react';
import style from './index.module.scss';
import classnames from 'classnames';
//MATERIAL-UI
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import useMediaQuery from '@material-ui/core/useMediaQuery';
//SWEETALERT2
import Swal from 'sweetalert2';
//REACT-HELMET
import { Helmet } from 'react-helmet';
import icon from '../images/icon.ico';
//COMPONENT
import Heading from '../components/Heading';
import Loading from '../components/Loading';
import ReadModal from '../components/ReadModal';
//GATSBYJS
import { graphql, useStaticQuery } from 'gatsby';

const truncate = (str: string, n: number) => str?.length > n ? `${str.substr(0, n-1)}` : str;

export default function() {
    const [ list, setList ] = useState<[{ id: string; text: string; }]>([]);
    const [ listIds, setListIds ] = useState<[string]>([]);

    const [ input, setInput ] = useState<string>('');
    const [ currentId, setCurrentId ] = useState<string>('');
    const [ updating, setUpdating ] = useState<boolean>(false);
    const [ loading, setLoading ] = useState<boolean>(false);

    const handleCreate = () => {
        if(input === '') {
            Swal.fire({
                icon: 'warning',
                title: '<p id="design">Cancelled</p>',
                text: `Message can't be blank!`,
                confirmButtonText: 'Retry'
            })
            .then(() => {
                setInterval(() => element.current.focus(), 500);
            })
        }
        else {
            setLoading(true);
            fetch(`/.netlify/functions/create`, {
                method: 'post',
                body: JSON.stringify({ message: input })                     //sending an object having 'message' property of text
            })
            .then(() => {
                //for refetch
                setListIds([]);                                              //initailize empty first
                handleReadall();                                             //render again to readall
            })
        }
    }

    const handleDelete = (thatId) => {
        setLoading(true);
        fetch(`/.netlify/functions/delete`, {
            method: 'post',
            body: JSON.stringify({ id: thatId })                             //sending an object having 'id' property of that message
        })
        .then(() => {
            //for refetch
            setListIds([]);                                                  //initailize empty first
            handleReadall();                                                 //render again to readall
            setLoading(false);
        })
    }

    const handleUpdate = (thatId, thatText) => {
        if(input === '') {
            Swal.fire({
                icon: 'warning',
                title: '<p id="design">Cancelled</p>',
                text: `Message can't be blank!`,
                confirmButtonText: 'Retry'
            })
            .then(() => {
                setInterval(() => element.current.focus(), 500);
            })
        }
        else {
            setLoading(true);
            fetch(`/.netlify/functions/update`, {
                method: 'post',
                body: JSON.stringify({ id: thatId, message: thatText })      //sending an object having 'id' property of that message
            })
            .then(() => {
                setUpdating(false);
                //for refetch
                setListIds([]);                                              //initailize empty first
                handleReadall();                                             //render again to readall
            })
        }
    }

    const handleReadall = () => {
        fetch(`/.netlify/functions/read-all`, {
            headers : {                                                      //for GET Method
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setListIds(data.map(obj => obj.id))                              //saving as array having all id from all objects
        })
    }

    const handleRead = (thatId) => {
        fetch(`/.netlify/functions/read`, {
            method: 'post',
            body: JSON.stringify({ id: thatId })                             //sending an object having 'id' property of that message
        })
        .then(res => res.json())
        .then(data => {                                                      // {id: ____, text: _____}
            setList(prev => [ ...prev, data ])                               //storing collections in the state
        })
    }

    const processUpdate = (thatId, thatText) => {
        element.current.focus();
        setUpdating(true);
        setInput(thatText);
        setCurrentId(thatId);
    }

    const element = useRef(null);
    useEffect(() => {
        element.current.focus();
        setListIds([]);                                                      //initailize empty first
        handleReadall();                                                     //render fun firstly
    }, [])

    useEffect(() => {
        setList([]);                                                         //initailize empty first
        listIds.map((thatId, i) => {
            handleRead(thatId);                                              //passing that particular id to read that collection
            (listIds.length === i + 1) && setLoading(false);
        })
    }, [listIds])

    const data = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    title
                }
            }
        }
    `)

    const screen250 = useMediaQuery('(max-width:250px)');
    list.sort((a, b) => (a.id > b.id) ? 1 : -1);                             //sorting array by 'id' property inside
    
    return (
        <>
            <Helmet>
                <title> {`${data.site.siteMetadata.title}`} </title>
                <link rel="shortcut icon" type='image/x-icon' href={icon}/>
            </Helmet>

            <div className={style.root}>
                <Heading
                />
    
                <Card className={classnames(style.card, "bg-light")} square raised>
                    {
                        (list.length !== 0 && !loading) && (
                            <div className={style.base}>
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlTextarea1">
                                        <h4> <span className="badge badge-warning badge-pill"> Messages </span> </h4>
                                    </label>
                                </div>
    
                                <table className="table table-borderless table-dark table-sm">
                                    <thead>
                                        {
                                            <tr>
                                                <th> # </th>
                                                <th> MESSAGE </th>
                                                <th> ID </th>
                                                <th> EDIT </th>
                                                <th> REMOVE </th>
                                            </tr>
                                        }
                                    </thead>
                                    <tbody>
                                        {
                                            list.map((obj, i) => (
                                                <tr key={i}>
                                                    <th> {i + 1} </th>
                                                    {obj.text.length < 10 ? <th className={style.text}> <span> {obj.text} </span> </th> : <th className={style.text}> <span> { truncate(obj.text, 10)} <ReadModal title={obj.id} notes={obj.text}/> </span> </th>}
                                                    <th> {obj.id} </th>
                                                    <th> <IconButton onClick={() => processUpdate(obj.id, obj.text) } color="inherit" size="small"> <EditIcon fontSize="small" style={{ color: 'golden' }}/> </IconButton> </th>
                                                    <th> <IconButton onClick={() => handleDelete(obj.id)} color="inherit" size="small"> <DeleteIcon fontSize="small" style={{ color: 'golden' }}/> </IconButton> </th>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )
                    }

                    {
                        loading && (
                            <Loading
                            />
                        )
                    }
    
                    <div className={style.body}>
                        <div className="form-group">
                            <textarea ref={element} onChange={(e) => setInput(e.target.value)} value={input} className="form-control" id="exampleFormControlTextarea1" rows="6"  placeholder="Enter a message . . ."></textarea>
                        </div>
    
                        <div className={style.btn}>
                            <Button onClick={!updating ? () => handleCreate() : () => handleUpdate(currentId, input)} color="secondary" variant="contained" fullWidth size={screen250 ? "small" : "medium"}>
                                {!updating ? `NEW MESSAGE` : `EDIT MESSAGE`}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}
