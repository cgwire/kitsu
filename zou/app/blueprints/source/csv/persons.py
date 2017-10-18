from zou.app.blueprints.source.csv.base import BaseCsvImportResource

from zou.app.models.person import Person
from zou.app.utils import auth, permissions

from sqlalchemy.exc import IntegrityError


class PersonsCsvImportResource(BaseCsvImportResource):

    def check_permissions(self):
        return permissions.check_admin_permissions()

    def import_row(self, row):
        first_name = row["First Name"]
        last_name = row["Last Name"]
        email = row["Email"]
        phone = row["Phone"]

        try:
            password = auth.encrypt_password("default")
            person = Person.create(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                phone=phone
            )
        except IntegrityError:
            person = Person.get_by(email=email)

        return person
