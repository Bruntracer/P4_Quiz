
const fs =require("fs");

//Modelo de datos

const DB_FILENAME = "quizzes.json";

let quizzes = [
		{
			question: "Capital de Italia",
			answer: "Roma"
		},
		{
			question: "Capital de Francia",
			answer: "París"
		},
		{
			question: "Capital de España",
			answer: "Madrid"
		},
		{
			question: "Capital de Portugal",
			answer: "Lisboa"
		}
	];

const load = () =>{

	fs.readFile(DB_FILENAME,(err, data) =>{
		if (err){

			// la primera vez no exixte el fichero
			if (err.code === "ENOENT") {
				save();
				return;
			}
			throw err;
		}

		let json = JSON.parse(data);

		if (json) {
			quizzes = json;
		}
	});
};

const save = () =>{

	fs.writeFile(DB_FILENAME,
		JSON.stringify(quizzes),
		err =>{
			if(err) throw err;
		});
};

	
/**
 *Devuelve el numero total de pregutnas exitentes.
 *@returns {number} numero total de preguntas
 */
exports.count = () => quizzes.length;

/**
 *Devuelve el numero total de pregutnas exitentes.
 *@param question String con la pregunta.
 *@param answer String con la respuesta.
 */
exports.add = (question, answer) => {
 	quizzes.push ({
 		question: (question || "").trim(),
 		answer:(answer || "").trim()
 	});
 	save();
 };

 /**
 *Devuelve el numero total de pregutnas exitentes.
 *@param question String con la pregunta.
 *@param answer String con la respuesta.
 */
 exports.update = (id, question, answer) =>{
 	const quiz = quizzes[id];
 	if (typeof quiz === "undefined"){
 		throw new Error(`El valor del parámetro id no es válido.`);
 	}
 	quizzes.splice(id, 1, {
 		question: (question || "").trim(),
 		answer:(answer || "").trim()
 	});
 	save();
 };

/**
 *Devuelve el numero total de pregutnas exitentes.
 *@param question String con la pregunta.
 *@param answer String con la respuesta.
 */
 exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

/**
 *Devuelve el numero total de pregutnas exitentes.
 *@param question String con la pregunta.
 *@param answer String con la respuesta.
 */
 exports.getByIndex = id => {
 	const quiz = quizzes[id];
 	if (typeof quiz === "undefined") {
 		throw new Error (`El valor del parametro ide no es valido.`);
 	}
 	return JSON.parse(JSON.stringify(quiz));
 };

/**
 *Devuelve el numero total de pregutnas exitentes.
 *@param question String con la pregunta.
 *@param answer String con la respuesta.
 */
 exports.deleteByIndex = id => {
 	const quiz = quizzes[id];
 	if (typeof quiz === "undefined") {
 		throw new Error (`El valor del parametro ide no es valido.`);
 	}
 	quizzes.splice(id,1);
 	save();
 };


//carga los quizzes almacenados
load();