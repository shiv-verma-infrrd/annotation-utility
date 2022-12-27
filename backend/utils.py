def get_user(user_id, users):
    for user in users.find():
        if user_id == str(user['_id']):
            return user
    return 'None'

def generate_batch_id(db):
    Db_data = list(db.batches.find({},{'batchId':1, '_id':0}))
    print(Db_data)

    batch_id = 0
    for x in Db_data:
        if x['batchId'] > batch_id:
            batch_id = x['batchId']

    return batch_id + 1
