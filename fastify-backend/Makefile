all:  dockerise undeploy deploy
	${MAKE} clean

dockerise:
	@docker build --no-cache -f Dockerfile -t fastify-backend:latest .
	${shell pwd}/../../push_image.sh fastify-backend:latest

deploy:
	@kubectl apply -f fastify-backend.yaml

undeploy:
	@kubectl delete -f fastify-backend.yaml >/dev/null 2>&1 || true

clean:
	- rm -f fastify-backend
