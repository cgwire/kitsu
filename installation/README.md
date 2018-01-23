# Installation

To run properly, Kitsu requires Zou, the database API. Information related to
both modules installation are located in the Zou installation documentation.

* [Deploying Zou](https://zou.cg-wire.com/)
* [Deploying Kitsu](https://zou.cg-wire.com/#deploying-kitsu)

If you have technical skills, you can run Kitsu / Zou through Docker to give it
a try:

```
docker run -d -p 80:80 --name cgwire cgwire/cgwire
```

Then you can access to Kitsu through [http://localhost](http://localhost)
