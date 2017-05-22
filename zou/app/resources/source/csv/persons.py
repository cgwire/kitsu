from zou.app.resources.source.csv.base import BaseCsvImportResource

from zou.app.models.person import Person

from sqlalchemy.exc import IntegrityError


class PersonsCsvImportResource(BaseCsvImportResource):

    def import_row(self, row):
        first_name = row["First Name"]
        last_name = row["Last Name"]
        email = row["Email"]

        try:
            person = Person.create(
                first_name=first_name,
                last_name=last_name,
                email=email
            )
        except IntegrityError:
            person = Person.get_by(email=email)

        return person
