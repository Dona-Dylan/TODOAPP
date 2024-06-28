import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import { dummy } from './dummy';
import axios from 'axios';

export function TODO(props) {
    const [newTodo, setNewTodo] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [todoData, setTodoData] = useState(dummy);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTodo, setCurrentTodo] = useState(null);
    const [currentDescription, setCurrentDescription] = useState(null);

    console.log("todoData", todoData);

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo();
            setTodoData(apiData);
            setLoading(false);
        };
        fetchTodo();
    }, []);

    const getTodo = async () => {
        const options = {
            method: "GET",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            }
        };
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (err) {
            console.log(err);
            return []; // return an empty array in case of error
        }
    };

    const addTodo = () => {
        const options = {
            method: "POST",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: newTodo,
                description: newDescription,
                done: false // Set the default value for the 'done' property
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => [...prevData, response.data.newTodo]);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const deleteTodo = (id) => {
        const options = {
            method: "DELETE",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.filter(todo => todo._id !== id));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const updateTodo = (id, updatedTitle, updatedDescription) => {
        const todoToUpdate = todoData.find(todo => todo._id === id);
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                ...todoToUpdate,
                title: updatedTitle || todoToUpdate.title,
                description: updatedDescription || todoToUpdate.description,
                done: (updatedTitle || updatedDescription) ? todoToUpdate.done : !todoToUpdate.done,
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.map(todo => todo._id === id ? response.data : todo));
                setIsEditing(false);
                setCurrentTodo(null);
                setCurrentDescription(null);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>
                    Tasks
                </h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        value={newTodo}
                        onChange={(event) => {
                            setNewTodo(event.target.value);
                        }}
                    />
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Description'
                        value={newDescription}
                        onChange={(event) => {
                            setNewDescription(event.target.value);
                        }}
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={() => {
                            addTodo();
                            setNewTodo('');
                            setNewDescription('');
                        }}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : (
                    todoData.length > 0 ? (
                        todoData.map((entry, index) => (
                            <div key={entry._id} className={Styles.todo}>
                                <div className={Styles.todoHeader}>
                                    {isEditing && currentTodo === entry._id ? (
                                        <span className={Styles.infoContainer}>
                                            <input
                                                type='text'
                                                value={entry.title}
                                                onChange={(e) => {
                                                    const updatedTitle = e.target.value;
                                                    setTodoData(prevData => prevData.map(todo => todo._id === entry._id ? { ...todo, title: updatedTitle } : todo));
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    updateTodo(entry._id, entry.title, entry.description);
                                                }}
                                            >
                                                Save
                                            </button>
                                        </span>
                                    ) : (
                                        <span className={Styles.infoContainer}>
                                            <input
                                                type='checkbox'
                                                checked={entry.done}
                                                onChange={() => {
                                                    updateTodo(entry._id);
                                                }}
                                            />
                                            <strong>{entry.title}</strong>
                                            <button
                                                className={Styles.editButton}
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setCurrentTodo(entry._id);
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </span>
                                    )}
                                    <button
                                        onClick={() => deleteTodo(entry._id)}
                                        className={Styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </div>
                                <div className={Styles.todoDescription}>
                                    {isEditing && currentDescription === entry._id ? (
                                        <span>
                                            <input
                                                type='text'
                                                value={entry.description}
                                                onChange={(e) => {
                                                    const updatedDescription = e.target.value;
                                                    setTodoData(prevData => prevData.map(todo => todo._id === entry._id ? { ...todo, description: updatedDescription } : todo));
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    updateTodo(entry._id, entry.title, entry.description);
                                                }}
                                                className={Styles.saveButton}
                                            >
                                                Save
                                            </button>
                                        </span>
                                    ) : (
                                        <>
                                            <p className={Styles.descriptionText}>{entry.description}</p>
                                            <button
                                                className={Styles.editButton}
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setCurrentDescription(entry._id);
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'white' }}>No tasks found.</p>
                    )
                )}
            </div>
        </div>
    );
}
