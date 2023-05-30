![MultiJuicer, Multi User Juice Shop Platform](./images/multijuicer-cover.svg)

Running CTFs and Security Trainings with [OWASP Juice Shop](https://github.com/bkimminich/juice-shop) is usually quite tricky, Juice Shop just isn't intended to be used by multiple users at a time.
Instructing everybody how to start Juice Shop on their own machine works ok, but takes away too much valuable time.

MultiJuicer gives you the ability to run separate Juice Shop instances for every participant on a central kubernetes cluster, to run events without the need for local Juice Shop instances.

> Note: MultiJuicer is now an official part of the Juice Shop OWASP Project. For this change the this repo was recently moved from the [iteratec](https://github.com/iteratec/) organisation into the official [juice-shop](https://github.com/juice-shop/) GitHub organisation. If you notice encounter any problems introduced by this change, check the [v6.0.0](https://github.com/juice-shop/multi-juicer/releases/tag/v6.0.0) changelog for possible upgrade steps, if the problems can't be solved by it please reach out via a GitHub discussion or via [slack](#talk-with-us).

**What it does:**

- dynamically create new Juice Shop instances when needed
- runs on a single domain, comes with a LoadBalancer sending the traffic to the participants Juice Shop instance
- backup and auto apply challenge progress in case of Juice Shop container restarts
- cleanup old & unused instances automatically

![MultiJuicer, High Level Architecture Diagram](./images/high-level-architecture.svg)

## Installation

MultiJuicer runs on kubernetes, to install it you'll need [helm](https://helm.sh)(helm >= 3.7 required)

```sh
helm install multi-juicer oci://ghcr.io/juice-shop/multi-juicer/helm/multi-juicer
```

See [production notes](./guides/production-notes/production-notes.md) for a checklist of values you'll likely need to configure before using MultiJuicer in proper events.

### Installation Guides for specific Cloud Providers / Environments

Generally MultiJuicer runs on pretty much any kubernetes cluster, but to make it easier for anybody who is new to kubernetes we got some guides on how to setup a kubernetes cluster with MultiJuicer installed for some specific Cloud providers.

- [Digital Ocean](./guides/digital-ocean/digital-ocean.md)
- [AWS](./guides/aws/aws.md)
- [OpenShift](./guides/openshift/openshift.md)
- [Plain Kubernetes](./guides/k8s/k8s.md)
- [Azure](./guides/azure/azure.md)

### Customizing the Setup

You got some options on how to setup the stack, with some option to customize the JuiceShop instances to your own liking.
You can find the default config values under: [helm/multi-juicer/values.yaml](./helm/multi-juicer/values.yaml)

Download & Save the file and tell helm to use your config file over the default by running:

```sh
helm install -f values.yaml multi-juicer ./multi-juicer/helm/multi-juicer/
```

### Deinstallation

```sh
helm delete multi-juicer
```

## FAQ

### How much compute resources will the cluster require?

To be on the safe side calculate with:

- _1GB memory & 1CPU overhead_, for the balancer & co
- _300MB & 0.2CPU \* number of participants_, for the individual JuiceShop Instances

The numbers above reflect the default resource limits. These can be tweaked, see: [Customizing the Setup](#customizing-the-setup)

### How many users can MultiJuicer handle?

There is no real fixed limit. (Even thought you can configure one 😉)
The custom LoadBalancer, through which all traffic for the individual Instances flows, can be replicated as much as you'd like.
You can also attach a [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) to automatically scale the LoadBalancer.

### Why a custom LoadBalancer?

There are some special requirements which we didn't find to be easily solved with any pre build load balancer:

- Restricting the number of users for a deployment to only the members of a certain team.
- The load balancers cookie must be save and not easy to spoof to access another instance.
- Handling starting of new instances.

If you have awesome ideas on how to overcome these issues without a custom load balancer, please write us, we'd love to hear from you!

### Why a separate kubernetes deployment for every team?

There are some pretty good reasons for this:

- The ability delete the instances of a team separately. Scaling down safely, without removing instances of active teams, is really tricky with a scaled deployment. You can only choose the desired scale not which pods to keep and which to throw away.
- To ensure that pods are still properly associated with teams after a pod gets recreated. This is a non problem with separate deployment and really hard with scaled deployments.
- The ability to embed the team name in the deployment name. This seems like a stupid reason but make debugging SOOO much easier, with just using `kubectl`.

### How to manage JuiceShop easily using `kubectl`?

You can list all JuiceShops with relevant information using the custom-columns feature of kubectl.
You'll need to down load the juiceShop.txt from the repository first:

```bash
$ https://raw.githubusercontent.com/juice-shop/multi-juicer/main/juiceShop.txt

$ kubectl get -l app.kubernetes.io/name=juice-shop -o custom-columns-file=juiceShop.txt deployments
TEAM         SOLVED-CHALLENGES   LAST-REQUEST
foobar       3                   Wed May 4 2042 18:14:22 GMT+0000 (Coordinated Universal Time)
team-42      0                   Wed May 4 2042 18:14:30 GMT+0000 (Coordinated Universal Time)
the-empire   0                   Wed May 4 2042 18:14:46 GMT+0000 (Coordinated Universal Time)
```

### Where did this project come from

The project start at [iteratec](https://www.iteratec.com), a german based software development company, to run their security trainings for their own developers and their clients.
The project was then open sourced in [2019](https://github.com/juice-shop/multi-juicer/releases/tag/v1.0.0) and donated to the OWASP organisation / the OWASP Juice Shop project in [2023](https://github.com/juice-shop/multi-juicer/releases/tag/v6.0.0).

## Talk with Us!

You can reach us in the `#project-juiceshop` channel of the OWASP Slack Workspace. We'd love to hear any feedback or usage reports you got. If you are not already in the OWASP Slack Workspace, you can join via [this link](https://owasp.slack.com/join/shared_invite/enQtNjExMTc3MTg0MzU4LWQ2Nzg3NGJiZGQ2MjRmNzkzN2Q4YzU1MWYyZTdjYjA2ZTA5M2RkNzE2ZjdkNzI5ZThhOWY5MjljYWZmYmY4ZjM)
