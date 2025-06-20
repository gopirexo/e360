"use client";
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useEffect, useState } from 'react';
import { currencySymbol, serverURL } from "@/utils/utils";
import { FiCheckCircle, FiDollarSign, FiEdit, FiFileText, FiPlus, FiSettings, FiShoppingCart, FiTrash, FiType } from 'react-icons/fi';

export default function Page() {
    const [items, setItems] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [evaluatorLimit, setEvaluatorLimit] = useState(0);
    const [evaluationLimit, setEvaluationLimit] = useState(0);
    const [price, setPrice] = useState(0);
    const [enable, setEnable] = useState(false);

    const [editItemId, setEditItemId] = useState("");
    const [deleteItemId, setDeleteItemId] = useState("");

    const getItems = async () => {
        const config = {
            method: "GET",
            url: `${serverURL}/admin/shop`,
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        };

        axios(config)
            .then((response) => {
                setItems(response.data);
            })
    }

    const createItem = async () => {
        if (!title) return toast.error("Please enter a title!");

        const config = {
            method: "POST",
            url: `${serverURL}/admin/shop/create`,
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": `application/json`,
            },
            data: {
                title: title,
                evaluatorLimit: evaluatorLimit,
                evaluationLimit: evaluationLimit,
                price: price,
            }
        };

        axios(config)
            .then((response) => {
                toast.success("Item created!");
                setTitle("");
                setEvaluatorLimit(0);
                setEvaluationLimit(0);
                setPrice(0);
                getItems();
            })
            .catch((error) => {
                toast.error("Something went wrong!");
            });
    }

    const editItem = async () => {
        if (!title) return toast.error("Please enter a title!");

        const config = {
            method: "POST",
            url: `${serverURL}/admin/shop/edit`,
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": `application/json`,
            },
            data: {
                itemId: editItemId,
                enable: enable,
                title: title,
                evaluatorLimit: evaluatorLimit,
                evaluationLimit: evaluationLimit,
                price: price,
            }
        };

        axios(config)
            .then((response) => {
                toast.success("Item updated!");
                setTitle("");
                setEvaluatorLimit(0);
                setEvaluationLimit(0);
                setPrice(0);
                setEnable(false);
                setEditItemId("");
                getItems();
            })
            .catch((error) => {
                toast.error("Something went wrong!");
            });
    }

    const deleteItem = async () => {
        const config = {
            method: "POST",
            url: `${serverURL}/admin/shop/delete`,
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": `application/json`,
            },
            data: {
                itemId: deleteItemId
            }
        };

        axios(config)
            .then((response) => {
                toast.success("Item deleted!");
                getItems();
            })
            .catch((error) => {
                toast.error("Something went wrong!");
            });
    }

    useEffect(() => {
        getItems();
    }, []);

    return <div className='animate-fade-in-bottom w-full h-full p-4'>
        <p className='font-semibold text-xl flex items-center mb-5'><FiShoppingCart className='mr-2' /> Shop</p>
        <div className='w-full flex flex-wrap'>
            {
                items.map((item, i) => {
                    return <div key={i} className="select-none card w-96 bg-base-100 shadow-xl mr-5 mb-5">
                        <div className="card-body">
                            <h2 className="card-title">
                                {item?.title}
                                <div className="badge badge-secondary">{["Free", "Paid"][item?.price <= 0 ? 0 : 1]}</div>
                                {!item?.enable ? <div className="badge badge-ghost">Disabled</div> : ""}
                            </h2>
                            <p className="font-semibold text-4xl mb-4">{currencySymbol} {item?.price}</p>
                            <p className='flex items-center'><FiSettings className='mr-2' />{item?.evaluatorLimit} Evaluators</p>
                            <p className='flex items-center mb-4'><FiFileText className='mr-2' />{item?.evaluationLimit} Evaluations</p>
                            <div className="card-actions justify-end">
                                <label htmlFor='edititem_modal' className='btn btn-sm' onClick={() => {
                                    setTitle(item?.title);
                                    setEvaluatorLimit(item?.evaluatorLimit);
                                    setEvaluationLimit(item?.evaluationLimit);
                                    setPrice(item?.price);
                                    setEditItemId(item?._id);
                                    setEnable(item?.enable);
                                }}><FiEdit />Edit</label>
                                <label htmlFor="deleteitem_modal" className='btn btn-sm' onClick={() => setDeleteItemId(item?._id)}><FiTrash />Delete</label>
                            </div>
                        </div>
                    </div>
                })
            }
            <label htmlFor='newitem_modal' className="btn h-auto min-h-[30vh] card w-96 bg-base-100 shadow-xl mr-5 mb-5">
                <FiPlus className='text-4xl' />
                <p>New Item</p>
            </label>
        </div>
        {/* New Item Modal */}
        <input type="checkbox" id="newitem_modal" className="modal-toggle" />
        <div className="modal">
            <div className="modal-box">
                <h3 className="flex items-center font-bold text-lg"><FiShoppingCart className="mr-1" /> New Item</h3>
                <p className="flex items-center py-4"><FiType className='mr-2' />Title</p>
                <input className="input input-bordered w-full" placeholder="Item title" type="text" onChange={(x) => setTitle(x.target.value)} value={title} />
                <p className="flex items-center py-4"><FiSettings className='mr-2' />Evaluator Limit</p>
                <input className="input input-bordered w-full" placeholder="Limit" type="number" min={1} onChange={(x) => setEvaluatorLimit(parseInt(x.target.value))} value={evaluatorLimit} />
                <p className="flex items-center py-4"><FiFileText className='mr-2' />Evaluation Limit</p>
                <input className="input input-bordered w-full" placeholder="Limit" type="number" min={1} onChange={(x) => setEvaluationLimit(parseInt(x.target.value))} value={evaluationLimit} />
                <p className="flex items-center py-4"><FiDollarSign className='mr-2' />Price</p>
                <input className="input input-bordered w-full" placeholder="Price" type="number" min={0} onChange={(x) => setPrice(parseInt(x.target.value))} value={price} />
                <div className="modal-action">
                    <label htmlFor="newitem_modal" className="btn">Cancel</label>
                    <label htmlFor="newitem_modal" className="btn btn-primary" onClick={() => createItem()}>Create item</label>
                </div>
            </div>
        </div>
        {/* Edit Item Modal */}
        <input type="checkbox" id="edititem_modal" className="modal-toggle" />
        <div className="modal">
            <div className="modal-box">
                <h3 className="flex items-center font-bold text-lg"><FiEdit className="mr-1" /> Edit Item</h3>
                <div className="form-control py-4">
                    <label className="label cursor-pointer">
                        <span className="flex items-center"><FiCheckCircle className="mr-2" />Enable</span>
                        <input type="checkbox" className="toggle" onChange={(x) => setEnable(x.target.checked)} checked={enable} />
                    </label>
                </div>
                <p className="flex items-center py-4"><FiType className='mr-2' />Title</p>
                <input className="input input-bordered w-full" placeholder="Item title" type="text" onChange={(x) => setTitle(x.target.value)} value={title} />
                <p className="flex items-center py-4"><FiSettings className='mr-2' />Evaluator Limit</p>
                <input className="input input-bordered w-full" placeholder="Limit" type="number" min={1} onChange={(x) => setEvaluatorLimit(parseInt(x.target.value))} value={evaluatorLimit} />
                <p className="flex items-center py-4"><FiFileText className='mr-2' />Evaluation Limit</p>
                <input className="input input-bordered w-full" placeholder="Limit" type="number" min={1} onChange={(x) => setEvaluationLimit(parseInt(x.target.value))} value={evaluationLimit} />
                <p className="flex items-center py-4"><FiDollarSign className='mr-2' />Price</p>
                <input className="input input-bordered w-full" placeholder="Price" type="number" min={0} onChange={(x) => setPrice(parseInt(x.target.value))} value={price} />
                <div className="modal-action">
                    <label htmlFor="edititem_modal" className="btn">Cancel</label>
                    <label htmlFor="edititem_modal" className="btn btn-primary" onClick={() => editItem()}>Save</label>
                </div>
            </div>
            <label htmlFor="edititem_modal" className="modal-backdrop"></label>
        </div>
        {/* Delete Item Modal */}
        <input type="checkbox" id="deleteitem_modal" className="modal-toggle" />
        <div className="modal">
            <div className="modal-box">
                <h3 className="flex items-center font-bold text-lg"><FiTrash className="mr-1" /> Delete Item</h3>
                <p className="py-4">Are you sure want to delete this item?</p>
                <div className="modal-action">
                    <label htmlFor="deleteitem_modal" className="btn">Cancel</label>
                    <label htmlFor="deleteitem_modal" className="btn btn-error" onClick={() => deleteItem()}>Delete</label>
                </div>
            </div>
            <label className="modal-backdrop" htmlFor="deleteitem_modal">Cancel</label>
        </div>
    </div>
}