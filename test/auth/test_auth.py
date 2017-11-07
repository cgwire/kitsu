import flask_bcrypt as bcrypt

from test.base import ApiDBTestCase

from zou.app.utils import auth

from flask_jwt_extended import get_jti, create_access_token

from zou.app.services import persons_service, auth_service
from zou.app.services.exception import (
    PersonNotFoundException,
    WrongPasswordException
)


class AuthTestCase(ApiDBTestCase):

    def setUp(self):
        super(AuthTestCase, self).setUp()

        self.generate_fixture_person()
        self.person.update({
            "password": auth.encrypt_password("secretpassword")
        })

        self.person_dict = self.person.serialize()
        self.credentials = {
            "email": self.person_dict["email"],
            "password": "secretpassword"
        }

    def test_load_user(self):
        person = persons_service.get_person(self.person.id)
        self.assertEqual(person["id"], str(self.person.id))
        persons_service.delete_person(person["id"])
        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_person,
            self.person.id
        )

    def test_encrypt_password(self):
        password = "my secret"
        pass_hash = auth.encrypt_password(password)
        self.assertGreater(len(pass_hash), len(password))
        self.assertNotEqual(pass_hash, password)
        self.assertTrue(bcrypt.check_password_hash(pass_hash, password))

    def test_validate_email(self):
        self.assertEqual(
            auth.validate_email("john@gmail.com"),
            "john@gmail.com"
        )
        self.assertRaises(
            auth.EmailNotValidException,
            auth.validate_email,
            "johngmail.com"
        )

    def test_validate_password(self):
        self.assertRaises(
            auth.PasswordTooShortException,
            auth.validate_password,
            "12345",
            "12345"
        )
        self.assertRaises(
            auth.PasswordsNoMatchException,
            auth.validate_password,
            "12345678",
            "12345676"
        )
        self.assertTrue(
            auth.validate_password("mypassword", "mypassword")
        )

    def test_check_credentials(self):
        self.person.update({
            "password": auth.encrypt_password("mypassword")
        })
        self.assertRaises(
            WrongPasswordException,
            auth_service.check_credentials,
            "john.doe@gmail.com",
            "mypassword2"
        )
        self.assertRaises(
            PersonNotFoundException,
            auth_service.check_credentials,
            "john.doe@yahoo.com",
            "mypassword2"
        )
        self.assertTrue(
            auth_service.check_credentials("john.doe@gmail.com", "mypassword")
        )

    def test_no_password_auth_strategy(self):
        person = auth_service.no_password_auth_strategy("john.doe@gmail.com")
        self.assertEquals(person["first_name"], "John")

    def test_local_auth_strategy(self):
        self.person.update({
            "password": auth.encrypt_password("mypassword")
        })
        self.assertRaises(
            WrongPasswordException,
            auth_service.local_auth_strategy,
            "john.doe@gmail.com",
            "mypassword2"
        )
        self.assertRaises(
            PersonNotFoundException,
            auth_service.local_auth_strategy,
            "john.doe@yahoo.com",
            "mypassword2"
        )
        person = auth_service.local_auth_strategy(
            "john.doe@gmail.com",
            "mypassword"
        )
        self.assertEquals(person["first_name"], "John")

    def test_register_tokens(self):
        # Complex to test, jwt extended requires a proper flask context to run.
        pass

    def test_revoke_tokens(self):
        # Complex to test, jwt extended requires a proper flask context to run.
        pass
