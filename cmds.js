
const Sequelize = require('sequelize');
const {log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');

exports.helpCmd = (socket,rl) => {
	log(socket,"Comandos:");
	log(socket,"h|help - Muestra esta ayuda.");
	log(socket,"list - Lista los quizzes existentes.");
	log(socket,"show <id> - Muestra la pregunta y la respuesta de quiz indicado.");
	log(socket,"add - Añadir nuevo quiz interactivamente.");
	log(socket,"delete <id> - Borra el quiz indicado.");
	log(socket,"edit <id> - Edita el quiz indicado.")
	log(socket,"test <id> - Prueba el quiz indicado.");
	log(socket,"p|play - Jugar a pretguntar aleatoriamente todos los quizzes.");
	log(socket,"credits - Creditos.");
	log(socket,"q|quit - Salir del programa.");
	rl.prompt();

};

exports.listCmd = (socket,rl) => {
	models.quiz.findAll()
	.each(quiz => {
			log(socket,` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

const makeQuestion = (rl,text) =>{

	return new Sequelize.Promise ((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer =>{
			resolve(answer.trim());
		});
	});
};


exports.addCmd =(socket, rl) => {

	makeQuestion(rl, 'Introduzca una pregunta: ')
	.then(q=>{
		return makeQuestion(rl, 'Introduzca la respuesta ')
		.then(a => {
			return{question: q , answer: a};
		});
	})
	.then(quiz =>{
		return models.quiz.create(quiz);
	})
	.then(quiz =>{
		log(socket,`[${colorize('Se ha añadido','magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket,'El quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(socket,message));
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

const validateId = id =>{

	return new Sequelize.Promise((resolve, reject) => {
		if(typeof id === "undefined") {
			reject(new Error(`Falta el parametro id`));
		}else{
			id = parseInt(id);
			if(Number.isNaN(id)){
				reject(new Error(`El valor del id no es un numero`));
			} else {
				resolve(id);
			}

		}
	});
};

exports.showCmd = (socket,rl,id) => {

	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz =>{
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}`);
		}
		log(socket,`[${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(error =>{
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.testCmd =(socket,rl,id) => {
	/*
	if (typeof id ==="undefined") {
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);
			rl.question(colorize(`${quiz.question}? `,'red'), resp =>{

				if (resp.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
					log(`Su respuesta es correcta.`);
					biglog('CORRECTO','green');
				}else{
					biglog('INCORRECTO','red');
					log(`Su respuesta es incorrecta.`);
				}
				rl.prompt();
			});

		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}*/
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then (quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		return makeQuestion(rl, `${quiz.question}? `)
            .then(a => {
                if (a.trim().toLowerCase() === quiz.answer.toLowerCase()) {
                    log(socket, "Su respuesta es correcta.");
                    biglog(socket, 'Correcta', 'green');
                } else {
                    log(socket,"Su respuesta es incorrecta.");
                    biglog(socket, 'Incorrecta', 'red');
                }

                rl.prompt();
            });
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, 'El quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(socket, message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then (() => {
		rl.prompt();
	});



};

exports.playCmd = (socket,rl) => {

	let score = 0;
    let toBeResolved = [];
    let preg_resp =[];

    models.quiz.findAll()
	.each(quiz => {
		preg_resp.push(quiz);
	})
	.then (() => {

		for (let i = 0; i < preg_resp.length; i++) {
            toBeResolved.push(i);
        }

		const playOne = () => {

			if (toBeResolved.length === 0) {
				log(socket, " No hay nada más que preguntar");
				log(socket, ` Fin del juego. Aciertos: ${score}`);
				biglog(socket, `${score}`, 'magenta');
				rl.prompt();
			} else {
				try{
					let id = Math.floor(Math.random() * toBeResolved.length);
					const quiz = preg_resp[toBeResolved[id]];
					toBeResolved.splice(id,1);

					return makeQuestion(rl, `${quiz.question}? `)
					.then(respuesta =>{
						if (respuesta.trim().toLowerCase() === quiz.answer.toLowerCase()) {
							score = score + 1;
							log(socket, ` CORRECTO - Lleva ${score} aciertos.`);
							playOne();
						} else {
							log(socket," INCORRECTO");
							log(socket,` Fin del juego. Aciertos: ${score}`);
                            //log(socket, `Respuesta incorrecta. Fin del examen. Aciertos: ${score}`);
							biglog(socket,`${score}`, 'magenta');
							rl.prompt();
						}
					});
				} catch(error) {
					errorlog(socket, error.message);
					rl.prompt();
				}
			}
		};

		playOne()
    })
	.catch(Sequelize.ValidationError, error => {
        errorlog(socket, 'El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then (() => {
		rl.prompt();
	});
	








				/*
				rl.question(colorize(`${quiz.question}? `,'red'), resp =>{

					if (resp.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
						biglog('CORRECTO','green');
						score++;

						log(`CORRECTO - Lleva  ${colorize(score,'green')} aciertos.`);
						//toBeResolved.splice(rndId,1);
						toBeResolved.splice(rnd,1);

						playOne();
					}else{
						biglog('INCORRECTO','red');
						log(`Su respuesta es incorrecta.`);
						log(`Fin del juego. Aciertos; ${colorize(score,'green')} `);
						rl.prompt();
					}

				});
				*/


};

exports.deleteCmd = (socket,rl,id) => {

	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error =>{
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.editCmd = (socket,rl,id) => {

	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz=>{
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id:${id}.`);
		}

		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
		return makeQuestion(rl, 'Introduzca la pregunta: ')
		.then(q=>{
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
			return makeQuestion(rl, 'Introduzca la respuesta ')
			.then(a => {
				quiz.question = q;
				quiz.answer = a;
				return quiz;
			});
		});
	})
	.then(quiz => {
		return quiz.save();
	})
	.then(quiz => {
		log(socket,` Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket,'El quiz es erroneo:');
		error.errors,forEach(({message}) => errorlog(message));
	})
	.catch(error =>{
		errorlog(socket,error.message);
	})
	.then(() => {
		rl.prompt();
	});

};




exports.creditsCmd = (socket,rl) => {
	log(socket,'Autor de la practica:');
	log(socket,'Bruno Gonzalez Lopez','green');
	rl.prompt();
};

exports.quitCmd = (socket,rl) =>{
	rl.close();
	socket.end();
};
