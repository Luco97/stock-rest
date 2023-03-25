import { HttpStatus, Injectable } from '@nestjs/common';

import { TagModel, TagRepoService, TagItemsCount } from '@models/tag';

@Injectable()
export class TagService {
  constructor(private _tagRepo: TagRepoService) {}

  findAll(params: {
    take: number;
    skip: number;
    term: string;
  }): Promise<[TagItemsCount[], number]> {
    const { skip, take, term } = params;

    return this._tagRepo.findAll({
      take: take || 10,
      skip: skip || 0,
      name: term || '',
    });
  }

  create(params: { name: string; description: string }): Promise<TagModel> {
    const { description, name } = params;

    return this._tagRepo.create({ name, description });
  }

  update(
    tagID: number,
    description: string,
  ): Promise<{ status: number; message: string; tag?: TagModel }> {
    return new Promise<{ status: number; message: string; tag?: TagModel }>(
      (resolve, reject) =>
        this._tagRepo.findAllByID([tagID]).then(([tag]) => {
          if (!tag)
            resolve({ status: HttpStatus.OK, message: 'no tag with that id' });
          else
            this._tagRepo.update(description, tag).then((newTag) =>
              resolve({
                status: HttpStatus.OK,
                message: `tag with id = ${newTag.id} updated`,
                tag: newTag,
              }),
            );
        }),
    );
  }
}
