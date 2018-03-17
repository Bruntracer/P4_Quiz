
const Sequelize = require('sequelize');
const {log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');

exports.helpCmd = rl => {
	log("Comandos:");
	log("h|help - Muestra esta ayuda.");
	log("list - Lista los quizzes existentes.");
	log("show <id> - Muestra la pregunta y la respuesta de quiz indicado.");
	log("add - Añadir nuevo quiz interactivamente.");	
	log("delete <id> - Borra el quiz indicado.");
	log("edit <id> - Edita el quiz indicado.")
	log("test <id> - Prueba el quiz indicado.");
	log("p|play - Jugar a pretguntar aleatoriamente todos los quizzes.");
	log("credits - Creditos.");
	log("q|quit - Salir del programa.");
	rl.prompt();

};

exports.listCmd = rl => {
	models.quiz.findAll()
	.each(quiz => {
			log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
	})
	.catch(error => {
		errorlog(error.message);
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


exports.addCmd = rl => {

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
		log(`[${colorize('Se ha añadido','magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(error.message);
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

exports.showCmd = (rl,id) => {
	
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz =>{
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}`);	
		}
		log(`[${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(error =>{
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.testCmd =(rl,id) => {
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
	.then(quiz =>{
		if (typeof id ==="undefined") {
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
		}	
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id:${id}.`);
		}

		
		return makeQuestion(rl, `${quiz.question}? `)
		.then(q=>{
			if (q.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
					log(`Su respuesta es correcta.`);
					//biglog('CORRECTO','green');
				}else{
					//biglog('INCORRECTO','red');
					log(`Su respuesta es incorrecta.`);
				}
		});
	})
	.catch(error =>{
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});


};

exports.playCmd = rl => {
	
	let score = 0;
	let toBeResolved = [];
	/*
	model.getAll().forEach((quiz,id) =>{
		toBeResolved.push(id);
	});
	*/
	models.quiz.findAll()
	.each(quiz => {
			toBeResolved.push(quiz.id);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		
	
		const playOne= () => {
			if(toBeResolved.length === 0){
				errorlog(`No hay nada mas que preguntar`);
				log(`Fin del juego!: ${colorize(score,'green')} aciertos.`);
				rl.prompt();

			}else{
			var rnd =Math.floor(Math.random()*toBeResolved.length);
			var rndId = toBeResolved[rnd];
			//var rndId = new Random().nextInt(toBeResolved.length);
			//let quiz = model.getByIndex(rndId);

			validateId(rndId)
			.then(id => models.quiz.findById(id))
			.then(quiz =>{
				if(!quiz){
					throw new Error(`No existe un quiz asociado al id:${id}.`);
				}

				
				return makeQuestion(rl, `${quiz.question}? `)
				.then(q=>{
					if (q.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
							log(`Su respuesta es correcta. correct`);
							//biglog('CORRECTO','green');
							score++;
							toBeResolved.splice(rnd,1);
							playOne();
						}else{
							//biglog('INCORRECTO','red');
							log(`Su respuesta es incorrecta. incorrect`);
							rl.prompt();
						}
				});
			})
			.catch(error =>{
				errorlog(error.message);
			})

			}


			
		}
		playOne();
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

exports.deleteCmd = (rl,id) => {

	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error =>{
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.editCmd = (rl,id) => {

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
		log(` Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erroneo:');
		error.errors,forEach(({message}) => errorlog(message));
	})
	.catch(error =>{
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
	
};




exports.creditsCmd = rl => {
	log('Autor de la practica:');
	log('Bruno Gonzalez Lopez','green');
	rl.prompt();
};

exports.quitCmd = rl =>{
	rl.close();
};
