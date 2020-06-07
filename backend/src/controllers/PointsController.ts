import { Request, Response, response } from 'express';
import knex from '../database/connection';

//Declarando um class para Points
class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;
    console.log(items);
    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return response.json(points);
  }

  //Primeiro método: Criar Point
  async create(request: Request, response: Response) {
    //Alocando meus parâmetros em variáveis
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    //Função transaction responsável por garantir que o primeiro insert só vai acontecer caso
    //o segundo insert também funcione
    const trx = await knex.transaction();

    //Criando uma variável "struct" para um point
    const point = {
      image: 'fake',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    //Resgatando o id do ponto cadastrado
    const insertedIds = await trx('points').insert(point);
    const point_id = insertedIds[0];

    //Varrendo os itens passados na requisição e vinculando ao
    //id do ponto cadastrado no banco Points para salvar em point_Itens
    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id,
      };
    });

    //Insert do point_Itens
    await trx('point_items').insert(pointItems);

    //Finalizando as inserções sem erros
    await trx.commit();

    //Visualização do objeto que foi salvo no banco points.
    return response.json({
      id: point_id,
      ...point,
    });
  }

  async show(request: Request, response: Response) {
    //Pegando id passado no prâmetro
    const { id } = request.params;
    // buscando ponto de coleta no banco
    const point = await knex('points').where('id', id).first();
    if (!point) {
      return response
        .status(400)
        .json({ message: 'Ponto de coleta não encontrado!' });
    }
    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({ point, items });
  }
}

export default PointsController;
